import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { createCatalogRoutes, CatalogModuleFactory, mediaSchema, type CatalogModuleConfig } from '@metacult/backend/catalog';
import { createDiscoveryRoutes, FeedController, GetMixedFeedHandler } from '@metacult/backend/discovery';
import { createAuthRoutes } from '@metacult/backend-identity';
import { interactionController as interactionRoutes } from '@metacult/backend/interaction';
import { importRoutes } from './src/routes/import.routes';
import { debugRoutes } from './src/routes/debug.routes';
import { getDbConnection, redisClient, requestContext, patchConsole } from '@metacult/backend/infrastructure';
import * as infraSchema from '@metacult/backend/infrastructure';
import { initCrons } from './src/cron/cron.service';
import { GetActiveAdsHandler, GetActiveAdsQuery } from '@metacult/backend/marketing';

// Apply logging patch
// Apply logging patch
patchConsole();

// Import migration script programmatically
import { runMigrations } from '@metacult/backend/infrastructure';

// Safe migration runner (Non-blocking to allow Healthcheck to pass)
runMigrations()
  .then(() => console.log('✅ Migrations executed successfully'))
  .catch((error) => console.error('❌ Failed to run migrations:', error));



// Initialisation de la BDD (Composition Root)
// Fusion des schémas pour garantir que le client DB satisfait tous les modules
import { userInteractions, actionEnum, sentimentEnum, DrizzleInteractionRepository } from '@metacult/backend/interaction';
const fullSchema = { ...infraSchema, ...mediaSchema, userInteractions, actionEnum, sentimentEnum };
// Initialisation du Singleton
const { db } = getDbConnection(fullSchema);

/**
 * Point d'entrée de l'Application API (Composition Root).
 * Responsabilités :
 * 1. Charger la configuration (Env vars).
 * 2. Initialiser les Adapters Infrastructure (DB, Redis).
 * 3. Instancier les modules Backend (Catalog, Discovery).
 * 4. Injecter les dépendances (Wiring).
 * 5. Monter les routes HTTP.
 */
console.log('🚀 Démarrage de l\'API (Elysia)...');


// --- COMPOSITION ROOT (Chargement de la Configuration) ---

// ✅ Lecture des variables d'environnement UNE SEULE FOIS au démarrage (Responsabilité du Composition Root)
// Note: Les variables sont chargées depuis apps/api/.env (pas de .env global)
const catalogConfig: CatalogModuleConfig = {
  igdb: {
    clientId: process.env.IGDB_CLIENT_ID || '',
    clientSecret: process.env.IGDB_CLIENT_SECRET || '',
  },
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
  },
  googleBooks: {
    apiKey: process.env.GOOGLE_BOOKS_API_KEY || '',
  },
};

// Validate critical env vars at startup (fail-fast principle)
if (!catalogConfig.igdb.clientId || !catalogConfig.igdb.clientSecret) {
  console.warn('⚠️  Identifiants IGDB manquants. L\'import de jeux échouera.');
  console.warn('   Configurez IGDB_CLIENT_ID et IGDB_CLIENT_SECRET dans apps/api/.env');
}
if (!catalogConfig.tmdb.apiKey) {
  console.warn('⚠️  Clé API TMDB manquante. L\'import de films/séries échouera.');
  console.warn('   Configurez TMDB_API_KEY dans apps/api/.env');
}
if (!catalogConfig.googleBooks.apiKey) {
  console.warn('⚠️  Clé API Google Books manquante. L\'import de livres échouera.');
  console.warn('   Configurez GOOGLE_BOOKS_API_KEY dans apps/api/.env');
}

// 1. Module Catalog
// ✅ Injection de la configuration dans la Factory (Principe Clean Architecture)
// Injection de redisClient pour le caching
const catalogController = CatalogModuleFactory.createController(db, catalogConfig, redisClient);
const catalogRoutes = createCatalogRoutes(catalogController);

// Discovery a besoin de `SearchMediaHandler`.
const searchHandler = CatalogModuleFactory.createSearchMediaHandler(db, catalogConfig, redisClient);


// 2. Module Marketing
const adsHandler = new GetActiveAdsHandler(redisClient);

// 3. Module Discovery (Relie Catalog & Marketing)
const mediaSearchAdapter = {
  search: async (q: string, options: { excludedIds?: string[], limit?: number, orderBy?: 'random' }) => {
    // Adaptateur: String -> SearchQuery -> DTO
    // Le handler retourne maintenant une réponse groupée. On doit l'aplatir pour le module Discovery.
    const grouped = await searchHandler.execute({
      search: q,
      excludedIds: options?.excludedIds,
      limit: options?.limit,
      orderBy: options?.orderBy
    });
    const all = [
      ...grouped.games,
      ...grouped.movies,
      ...grouped.shows,
      ...grouped.books
    ];

    // Mapping vers MediaReadDto (attendu par Discovery ?)
    return all.map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      coverUrl: item.poster,
      rating: null, // Pas dispo dans search result léger
      releaseYear: item.year,
      description: null, // Pas dispo
      isImported: item.isImported
    }));
  }
};

const adsAdapter = {
  getAds: async () => {
    // Adaptateur: Void -> Query -> DTO
    return adsHandler.execute(new GetActiveAdsQuery());
  }
};

const mixedFeedHandler = new GetMixedFeedHandler(redisClient, mediaSearchAdapter, adsAdapter);
const interactionRepo = new DrizzleInteractionRepository(db);
const feedController = new FeedController(mixedFeedHandler, interactionRepo);
const discoveryRoutes = createDiscoveryRoutes(feedController);

// 4. Module Identity (Auth routes)
const authRoutes = createAuthRoutes();

// Initialisation des tâches Cron
initCrons().catch(console.error);



// ... (existing code)

const app = new Elysia()
  .use(swagger())
  .use(cors({
    origin: true, // Allow all origins in dev, or specify ['http://localhost:5173', 'http://localhost:4200']
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
  }))
  .onRequest(({ request, set }) => {
    // Ensure response has the ID (retrieved from ALS or Header)
    const requestId = requestContext.getRequestId() || request.headers.get('x-request-id');
    if (requestId) {
      set.headers['x-request-id'] = requestId;
    }
    console.log(`[API] ${request.method} ${request.url}`);
  })
  .get('/', () => 'Hello Metacult API (Elysia)')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  // Montage des routes
  .use(authRoutes)
  .group('/api', (app) => app
    .group('/import', (app) => app.use(importRoutes))
    .use(debugRoutes)
    .use(catalogRoutes)
    .use(discoveryRoutes)
    .use(interactionRoutes)
  );

const port = Number(process.env.PORT) || 3000;

// Wrap the fetch handler to initialize AsyncLocalStorage
const originalFetch = app.fetch;
const wrappedFetch = function (request: Request) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const finalRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    // Add other properties if needed, e.g., referrer, mode, credentials, cache, redirect, integrity, keepalive
  }); // Keep finalRequest if it was used, or simplify if not.

  return requestContext.run({ requestId }, () => {
    return originalFetch.call(app, finalRequest);
  });
};

const server = Bun.serve({
  port,
  hostname: '0.0.0.0', // Bind to 0.0.0.0 for IPv4 compatibility (Railway/Docker)
  fetch: wrappedFetch
});

console.log(`🦊 Elysia tourne sur ${server.hostname}:${server.port}`);
