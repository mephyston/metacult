import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { helmet } from 'elysia-helmet';
import { rateLimit } from 'elysia-rate-limit';
import { swagger } from '@elysiajs/swagger';
import {
  createCatalogRoutes,
  CatalogModuleFactory,
  type CatalogModuleConfig,
  MediaType,
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
import {
  createCommerceRoutes,
  CommerceModuleFactory,
  type CommerceModuleConfig,
} from '@metacult/backend-commerce';
import { importRoutes } from './src/routes/import.routes';
import { debugRoutes } from './src/routes/debug.routes';
import { syncRoutes } from './src/routes/sync.routes';
import {
  getDbConnection,
  redisClient,
  requestContext,
  logger,
} from '@metacult/backend-infrastructure';
// eslint-disable-next-line no-restricted-syntax -- Schema import for DB initialization
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
    options: {
      excludedIds?: string[];
      limit?: number;
      orderBy?: 'random';
      types?: string[];
    },
  ) => {
    // Adaptateur: String -> SearchQuery -> DTO
    // Le handler retourne maintenant une réponse groupée ou paginée (Mode B).
    const result = await searchHandler.execute({
      search: q,
      excludedIds: options?.excludedIds,
      limit: options?.limit,
      orderBy: options?.orderBy,
      types: options?.types
        ? (options.types
            .map((t) => {
              const upper = t.toUpperCase();
              return Object.values(MediaType).includes(upper as MediaType)
                ? (upper as MediaType)
                : undefined;
            })
            .filter(Boolean) as MediaType[])
        : undefined,
    });

    if (result.isFailure()) {
      throw result.getError();
    }

    const searchResponse = result.getValue();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const all: any[] =
      'items' in searchResponse
        ? searchResponse.items
        : [
            ...searchResponse.games,
            ...searchResponse.movies,
            ...searchResponse.shows,
            ...searchResponse.books,
          ];

    // Populate offers (N+1 but limited by page size, e.g., 5 items)
    // In production, use a DataLoader or BatchQuery.
    return Promise.all(
      all.map(async (item) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let offers: any[] = [];
        try {
          // We reuse the Commerce Handler directly via Controller
          const domainOffers = await commerceController.getOffers(item.id);
          offers = [...domainOffers];
        } catch (e) {
          logger.warn(
            { err: e, mediaId: item.id },
            '[Discovery] Failed to fetch offers for feed item',
          );
        }

        const mappedItem = {
          id: item.id,
          title: item.title,
          type: item.type,
          coverUrl: item.poster,
          rating: null,
          releaseYear: item.year,
          description: null,
          isImported: item.isImported,
          offers, // Attached offers
        };

        if (!mappedItem.type) {
          logger.warn(
            { itemId: item.id, itemTitle: item.title },
            '[Discovery] Item missing type in adapter',
          );
        }

        return mappedItem;
      }),
    );
  },
};

const adsAdapter = {
  getAds: async () => {
    // Adaptateur: Void -> Query -> DTO
    const result = await adsHandler.execute();
    if (result.isFailure()) {
      throw result.getError();
    }
    return result.getValue();
  },
};

const mixedFeedHandler = new GetMixedFeedHandler(
  redisClient,
  mediaSearchAdapter,
  adsAdapter,
);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const recommendationRepo = new DrizzleRecommendationRepository(db as any);
const personalizedFeedHandler = new GetPersonalizedFeedHandler(
  recommendationRepo,
);
// eslint-disable-next-line no-restricted-syntax -- Schema import for DB initialization
import * as interactionSchema from '@metacult/backend-interaction';
// ...
const interactionRepo = new DrizzleInteractionRepository(
  db as unknown as NodePgDatabase<typeof interactionSchema>,
);

// --- Discovery Catalog Queries Wiring ---
import {
  DrizzleCatalogRepository,
  DrizzleRecommendationRepository,
  GetTrendingHandler,
  GetHallOfFameHandler,
  GetControversialHandler,
  GetUpcomingHandler,
  GetTopRatedByYearHandler,
} from '@metacult/backend-discovery';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// 5. Module Commerce
const commerceConfig: CommerceModuleConfig = {
  tmdb: {
    apiKey: configService.get('TMDB_API_KEY') || '',
  },
  affiliate: {
    instantGamingRef: configService.get('INSTANT_GAMING_REF'),
    amazonTag: configService.get('AMAZON_TAG'),
  },
};
const commerceController = CommerceModuleFactory.createController(
  db as unknown as NodePgDatabase<typeof mediaSchema>,
  commerceConfig,
);
const commerceRoutes = createCommerceRoutes(commerceController);

// Initialisation des tâches Cron
initCrons().catch((err) =>
  logger.error({ err }, 'Failed to initialize cron jobs'),
);

// ... (existing code)

const app = new Elysia()
  // CRITICAL: Auth routes FIRST to prevent body consumption by middleware
  .use(authRoutes)
  .use(errorMiddleware) // ✅ Global error handling FIRST
  .use(helmet()) // 🛡️ Security Headers
  .use(
    rateLimit({
      duration: 60000,
      max: 100,
      errorResponse: 'Rate limit exceeded',
      // Extract client IP from proxy headers (Railway, Nginx, etc.)
      generator: (request) => {
        // Try X-Forwarded-For first (most common proxy header)
        const forwarded = request.headers.get('x-forwarded-for');
        if (forwarded) {
          // X-Forwarded-For can be a comma-separated list, take the first (original client)
          const clientIp = forwarded.split(',')[0]?.trim();
          if (clientIp) return clientIp;
        }

        // Fallback to X-Real-IP
        const realIp = request.headers.get('x-real-ip');
        if (realIp) return realIp;

        // Last resort: try to get from request context (may be undefined in Docker)
        return 'unknown';
      },
    }),
  )
  .use(swagger())
  .use(
    cors({
      origin: (request): boolean => {
        const origin = request.headers.get('origin');
        if (!origin) return true; // Allow non-browser requests (mobile/curl)

        if (configService.isDevelopment) return true;

        // Allow allowed origins
        const allowedOrigins = [
          configService.publicWebsiteUrl,
          configService.publicWebappUrl,
          ...configService.betterAuthTrustedOrigins,
        ].filter(Boolean) as string[];

        return allowedOrigins.includes(origin);
      },
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
  // Other routes after middleware
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

      .use(interactionRoutes)
      .use(mediaRoutes)
      .use(socialRoutes)
      .use(commerceRoutes)
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

export type App = typeof app;
