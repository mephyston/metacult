import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import {
  createCatalogRoutes,
  CatalogModuleFactory,
  type CatalogModuleConfig,
} from '@metacult/backend-catalog';
import {
  createDiscoveryRoutes,
  FeedController,
  GetMixedFeedHandler,
  GetPersonalizedFeedHandler,
  mediaController as mediaRoutes,
} from '@metacult/backend-discovery';
import {
  createAuthRoutes,
  userController as userRoutes,
  initAuth,
} from '@metacult/backend-identity';
import {
  interactionController as interactionRoutes,
  socialController as socialRoutes,
} from '@metacult/backend-interaction';
import {
  DuelController as duelRoutes,
  RankingController as rankingRoutes,
} from '@metacult/backend-ranking';
import {
  GamificationController as gamificationRoutes,
  userStats,
} from '@metacult/backend-gamification';
import { importRoutes } from './src/routes/import.routes';
import { debugRoutes } from './src/routes/debug.routes';
import { syncRoutes } from './src/routes/sync.routes';
import {
  getDbConnection,
  redisClient,
  requestContext,
  logger,
} from '@metacult/backend-infrastructure';
import * as infraSchema from '@metacult/backend-infrastructure';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { initCrons } from './src/cron/cron.service';
import { errorMiddleware } from './src/middlewares/error.middleware';
import {
  GetActiveAdsHandler,
  RedisAdsAdapter,
} from '@metacult/backend-marketing';

import { runMigrations } from '@metacult/backend-infrastructure';

// Safe migration runner (Non-blocking to allow Healthcheck to pass)
runMigrations()
  .then(() => logger.info('✅ Migrations executed successfully'))
  .catch((error) =>
    logger.error({ err: error }, '❌ Failed to run migrations'),
  );

// Initialisation de la BDD (Composition Root)
import { mediaSchema } from '@metacult/backend-catalog';
import {
  userInteractions,
  userFollows,
  actionEnum,
  sentimentEnum,
  DrizzleInteractionRepository,
} from '@metacult/backend-interaction';
const fullSchema = {
  ...infraSchema,
  ...mediaSchema,
  userInteractions,
  userFollows,
  actionEnum,
  sentimentEnum,
  userStats, // Gamification
};
// Initialisation du Singleton
const { db } = getDbConnection(fullSchema);
initAuth(); // Initialize Auth with correct DB instance

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
import { configService } from '@metacult/backend-infrastructure';

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
const adsGateway = new RedisAdsAdapter(redisClient);
const adsHandler = new GetActiveAdsHandler(adsGateway);

// 3. Module Discovery (Relie Catalog & Marketing)
const mediaSearchAdapter = {
  search: async (
    q: string,
    options: { excludedIds?: string[]; limit?: number; orderBy?: 'random' },
  ) => {
    // Adaptateur: String -> SearchQuery -> DTO
    // Le handler retourne maintenant une réponse groupée ou paginée (Mode B).
    const result = await searchHandler.execute({
      search: q,
      excludedIds: options?.excludedIds,
      limit: options?.limit,
      orderBy: options?.orderBy,
    });

    let all: any[] = [];

    // Type Guard pour déterminer si c'est Grouped ou Paginated
    if ('items' in result) {
      // Mode Paginated (Mode B ou Empty Search)
      all = result.items;
    } else {
      // Mode Grouped (Mode A)
      all = [
        ...result.games,
        ...result.movies,
        ...result.shows,
        ...result.books,
      ];
    }

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
    return adsHandler.execute();
  },
};

const mixedFeedHandler = new GetMixedFeedHandler(
  redisClient,
  mediaSearchAdapter,
  adsAdapter,
);
const personalizedFeedHandler = new GetPersonalizedFeedHandler(db);
import * as interactionSchema from '@metacult/backend-interaction';
// ...
const interactionRepo = new DrizzleInteractionRepository(
  db as unknown as NodePgDatabase<typeof interactionSchema>,
);

// --- Discovery Catalog Queries Wiring ---
import {
  DrizzleCatalogRepository,
  GetTrendingHandler,
  GetHallOfFameHandler,
  GetControversialHandler,
  GetUpcomingHandler,
  GetTopRatedByYearHandler,
} from '@metacult/backend-discovery';

const discoveryCatalogRepo = new DrizzleCatalogRepository(db as any);
const getTrendingHandler = new GetTrendingHandler(discoveryCatalogRepo);
const getHallOfFameHandler = new GetHallOfFameHandler(discoveryCatalogRepo);
const getControversialHandler = new GetControversialHandler(
  discoveryCatalogRepo,
);
const getUpcomingHandler = new GetUpcomingHandler(discoveryCatalogRepo);
const getTopRatedByYearHandler = new GetTopRatedByYearHandler(
  discoveryCatalogRepo,
);

const feedController = new FeedController(
  mixedFeedHandler,
  personalizedFeedHandler,
  interactionRepo,
  getTrendingHandler,
  getHallOfFameHandler,
  getControversialHandler,
  getUpcomingHandler,
  getTopRatedByYearHandler,
);
const discoveryRoutes = createDiscoveryRoutes(feedController);

// 4. Module Identity (Auth routes)
const authRoutes = createAuthRoutes();

// Initialisation des tâches Cron
initCrons().catch((err) =>
  logger.error({ err }, 'Failed to initialize cron jobs'),
);

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
  .get('/health', () => {
    const displayVersion = process.env.APP_VERSION || 'Dev';
    const sha =
      process.env.GIT_SHA ||
      process.env.RAILWAY_GIT_COMMIT_SHA ||
      process.env.GIT_COMMIT_SHA ||
      'local';

    return {
      status: 'ok',
      version: displayVersion,
      commit: sha === 'local' ? 'local' : sha.substring(0, 7),
      timestamp: new Date().toISOString(),
    };
  })
  // Montage des routes
  .use(authRoutes)
  .group('/api', (app) =>
    app
      .group('/import', (app) => app.use(importRoutes))
      .use(userRoutes)
      // ⚠️ DANGER: Debug routes (Sync triggers, etc.) - DEV ONLY
      .use((app) => {
        if (process.env.NODE_ENV !== 'production') {
          return app.use(debugRoutes);
        }
        return app;
      })
      .use(syncRoutes)
      .use(catalogRoutes)
      .use(discoveryRoutes)
      .use(mediaRoutes)
      .use(interactionRoutes)
      .use(socialRoutes)
      .use(duelRoutes)
      .use(rankingRoutes)
      .use(gamificationRoutes),
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
  hostname: '::', // Bind to :: for IPv6 (Railway Private Network) & IPv4 compatibility
  fetch: wrappedFetch,
});

logger.info({ port, hostname: server.hostname }, `✅ Elysia API running`);
logger.info(`✨ Production Build Triggered`);
logger.info(`📖 Swagger: http://localhost:${port}/swagger`);
