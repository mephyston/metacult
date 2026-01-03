import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import {
  createCatalogRoutes,
  CatalogModuleFactory,
  type CatalogModuleConfig,
} from '@metacult/backend/catalog';
import {
  createDiscoveryRoutes,
  FeedController,
  GetMixedFeedHandler,
} from '@metacult/backend/discovery';
import { createAuthRoutes } from '@metacult/backend-identity';
import { interactionController as interactionRoutes } from '@metacult/backend/interaction';
import {
  DuelController as duelRoutes,
  RankingController as rankingRoutes,
} from '@metacult/backend/ranking';
import { importRoutes } from './src/routes/import.routes';
import { debugRoutes } from './src/routes/debug.routes';
import {
  getDbConnection,
  redisClient,
  requestContext,
  logger,
} from '@metacult/backend/infrastructure';
import * as infraSchema from '@metacult/backend/infrastructure';
import { initCrons } from './src/cron/cron.service';
import { errorMiddleware } from './src/middlewares/error.middleware';
import {
  GetActiveAdsHandler,
  GetActiveAdsQuery,
} from '@metacult/backend/marketing';

import { runMigrations } from '@metacult/backend/infrastructure';

// Safe migration runner (Non-blocking to allow Healthcheck to pass)
runMigrations()
  .then(() => logger.info('✅ Migrations executed successfully'))
  .catch((error) =>
    logger.error({ err: error }, '❌ Failed to run migrations'),
  );

// Initialisation de la BDD (Composition Root)
import { mediaSchema, DrizzleMediaRepository } from '@metacult/backend/catalog';
import {
  userInteractions,
  actionEnum,
  sentimentEnum,
  DrizzleInteractionRepository,
} from '@metacult/backend/interaction';
const fullSchema = {
  ...infraSchema,
  ...mediaSchema,
  userInteractions,
  actionEnum,
  sentimentEnum,
};
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
logger.info("🚀 Démarrage de l'API (Elysia)...");

// --- COMPOSITION ROOT (Chargement de la Configuration) ---
import { configService } from '@metacult/backend/infrastructure';

// ✅ Lecture de la configuration via le service validé
logger.info(`🔌 API Config: NODE_ENV=${configService.get('NODE_ENV')}`);

const catalogConfig: CatalogModuleConfig = {
  igdb: {
    clientId: configService.get('IGDB_CLIENT_ID') || '',
    clientSecret: configService.get('IGDB_CLIENT_SECRET') || '',
  },
  tmdb: {
    apiKey: configService.get('TMDB_API_KEY') || '',
  },
  googleBooks: {
    apiKey: configService.get('GOOGLE_BOOKS_API_KEY') || '',
  },
};

// 1. Module Catalog
// ✅ Injection de la configuration dans la Factory (Principe Clean Architecture)
// Injection de redisClient pour le caching
const catalogController = CatalogModuleFactory.createController(
  db,
  catalogConfig,
  redisClient,
);
const catalogRoutes = createCatalogRoutes(catalogController);

// Discovery a besoin de `SearchMediaHandler`.
const searchHandler = CatalogModuleFactory.createSearchMediaHandler(
  db,
  catalogConfig,
  redisClient,
);

// 2. Module Marketing
const adsHandler = new GetActiveAdsHandler(redisClient);

// 3. Module Discovery (Relie Catalog & Marketing)
const mediaSearchAdapter = {
  search: async (
    q: string,
    options: { excludedIds?: string[]; limit?: number; orderBy?: 'random' },
  ) => {
    // Adaptateur: String -> SearchQuery -> DTO
    // Le handler retourne maintenant une réponse groupée. On doit l'aplatir pour le module Discovery.
    const grouped = await searchHandler.execute({
      search: q,
      excludedIds: options?.excludedIds,
      limit: options?.limit,
      orderBy: options?.orderBy,
    });
    const all = [
      ...grouped.games,
      ...grouped.movies,
      ...grouped.shows,
      ...grouped.books,
    ];

    // Mapping vers MediaReadDto (attendu par Discovery ?)
    return all.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      coverUrl: item.poster,
      rating: null, // Pas dispo dans search result léger
      releaseYear: item.year,
      description: null, // Pas dispo
      isImported: item.isImported,
    }));
  },
};

const adsAdapter = {
  getAds: async () => {
    // Adaptateur: Void -> Query -> DTO
    return adsHandler.execute(new GetActiveAdsQuery());
  },
};

const mixedFeedHandler = new GetMixedFeedHandler(
  redisClient,
  mediaSearchAdapter,
  adsAdapter,
);
const interactionRepo = new DrizzleInteractionRepository(db);
const feedController = new FeedController(mixedFeedHandler, interactionRepo);
const discoveryRoutes = createDiscoveryRoutes(feedController);

// 4. Module Identity (Auth routes)
const authRoutes = createAuthRoutes();

// Initialisation des tâches Cron
initCrons().catch(console.error);

// ... (existing code)

const app = new Elysia()
  .use(errorMiddleware) // ✅ Global error handling FIRST
  .use(swagger())
  .use(
    cors({
      origin: true, // Allow all origins in dev, or specify ['http://localhost:5173', 'http://localhost:4200']
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    }),
  )
  .onRequest(({ request, set }) => {
    // Ensure response has the ID (retrieved from ALS or Header)
    const requestId =
      requestContext.getRequestId() || request.headers.get('x-request-id');
    if (requestId) {
      set.headers['x-request-id'] = requestId;
    }
    logger.debug({ method: request.method, url: request.url }, '[API Request]');
  })
  .get('/', () => 'Hello Metacult API (Elysia)')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  // Montage des routes
  .use(authRoutes)
  .group('/api', (app) =>
    app
      .group('/import', (app) => app.use(importRoutes))
      .use(debugRoutes)
      .use(catalogRoutes)
      .use(discoveryRoutes)

      .use(interactionRoutes)
      .use(duelRoutes)
      .use(rankingRoutes),
  );

const port = configService.get('API_PORT');

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
  fetch: wrappedFetch,
});

logger.info({ port, hostname: server.hostname }, `✅ Elysia API running`);
logger.info(`📖 Swagger: http://localhost:${port}/swagger`);
