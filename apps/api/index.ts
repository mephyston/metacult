import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { createCatalogRoutes, CatalogModuleFactory, mediaSchema, type CatalogModuleConfig } from '@metacult/backend/catalog';
import { createDiscoveryRoutes, FeedController, GetMixedFeedHandler } from '@metacult/backend/discovery';
import { authRoutes } from './src/routes/auth.routes';
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
// This ensures migrations run even if start.sh is bypassed (e.g. Railway default cmd)
import { runMigrations } from '@metacult/backend/infrastructure/src/lib/db/migrate';

await runMigrations();

// Initialisation de la BDD (Composition Root)
// Fusion des schémas pour garantir que le client DB satisfait tous les modules
const fullSchema = { ...infraSchema, ...mediaSchema };
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
console.log('🔌 Connexion à la base de données...');

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
const catalogRoutesRouter = createCatalogRoutes(catalogController);

// Discovery a besoin de `SearchMediaHandler`.
const searchHandler = CatalogModuleFactory.createSearchMediaHandler(db, catalogConfig, redisClient);


// 2. Module Marketing
const adsHandler = new GetActiveAdsHandler(redisClient);

// 3. Module Discovery (Relie Catalog & Marketing)
const mediaSearchAdapter = {
  search: async (q: string) => {
    // Adaptateur: String -> SearchQuery -> DTO
    // Le handler retourne maintenant une réponse groupée. On doit l'aplatir pour le module Discovery.
    const grouped = await searchHandler.execute({ search: q });
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
const feedController = new FeedController(mixedFeedHandler);
const discoveryRoutes = createDiscoveryRoutes(feedController);

// Initialisation des tâches Cron
initCrons().catch(console.error);



// ... (existing code)

const app = new Elysia()
  .use(swagger())
  .use(cors())
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
    .get('/debug/ping', () => 'pong')
    .use(catalogRoutesRouter)
    .use(discoveryRoutes)
  );

const port = Number(process.env.PORT) || 3000;

// Wrap the fetch handler to initialize AsyncLocalStorage
const originalFetch = app.fetch;
const wrappedFetch = function (request: Request) {
  // DEBUG: Check if wrapper is called
  console.log(`[DEBUG] Raw Request: ${request.method} ${request.url}`);

  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  let finalRequest = request;

  if (!request.headers.has('x-request-id')) {
    // ... logic checks
  }

  return requestContext.run({ requestId }, () => {
    console.log(`[DEBUG] Context Initialized: ${requestId}`);
    return originalFetch.call(app, finalRequest);
  });
};

const server = Bun.serve({
  port,
  hostname: '0.0.0.0',
  fetch: wrappedFetch
});

console.log(`🦊 Elysia tourne sur ${server.hostname}:${server.port}`);
