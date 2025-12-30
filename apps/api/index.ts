import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { createCatalogRoutes, CatalogModuleFactory, mediaSchema, type CatalogModuleConfig } from '@metacult/backend/catalog';
import { createDiscoveryRoutes, FeedController, GetMixedFeedHandler } from '@metacult/backend/discovery';
import { authRoutes } from './src/routes/auth.routes';
import { importRoutes } from './src/routes/import.routes';
import { getDbConnection, redisClient } from '@metacult/backend/infrastructure';
import * as infraSchema from '@metacult/backend/infrastructure';
import { initCrons } from './src/cron/cron.service';
import { GetActiveAdsHandler, GetActiveAdsQuery } from '@metacult/backend/marketing';

// Initialize DB (Composition Root)
// Merge schemas to ensure DB client satisfies all module requirements
const fullSchema = { ...infraSchema, ...mediaSchema };
// Initialize Singleton
const { db } = getDbConnection(fullSchema);

console.log('🚀 Initializing API (Elysia)...');
console.log('🔌 Connecting to Database...');

// --- COMPOSITION ROOT (Configuration Loading) ---

// ✅ Read environment variables ONCE at startup (Composition Root responsibility)
// Note: Variables are loaded from apps/api/.env (not a global .env)
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
  console.warn('⚠️  IGDB credentials missing. Game import will fail.');
  console.warn('   Configure IGDB_CLIENT_ID and IGDB_CLIENT_SECRET in apps/api/.env');
}
if (!catalogConfig.tmdb.apiKey) {
  console.warn('⚠️  TMDB API key missing. Movie/TV import will fail.');
  console.warn('   Configure TMDB_API_KEY in apps/api/.env');
}
if (!catalogConfig.googleBooks.apiKey) {
  console.warn('⚠️  Google Books API key missing. Book import will fail.');
  console.warn('   Configure GOOGLE_BOOKS_API_KEY in apps/api/.env');
}

// 1. Catalog Module
// ✅ Inject configuration into Factory (Clean Architecture principle)
const catalogController = CatalogModuleFactory.createController(db, catalogConfig);
const catalogRoutesRouter = createCatalogRoutes(catalogController);

// Discovery needs `SearchMediaHandler`.
const searchHandler = CatalogModuleFactory.createSearchMediaHandler(db);


// 2. Marketing Module
const adsHandler = new GetActiveAdsHandler(redisClient);

// 3. Discovery Module (Wires Catalog & Marketing)
const mediaSearchAdapter = {
  search: async (q: string) => {
    // Adapter: String -> SearchQuery -> DTO
    return searchHandler.execute({ search: q });
  }
};

const adsAdapter = {
  getAds: async () => {
    // Adapter: Void -> Query -> DTO
    return adsHandler.execute(new GetActiveAdsQuery());
  }
};

const mixedFeedHandler = new GetMixedFeedHandler(redisClient, mediaSearchAdapter, adsAdapter);
const feedController = new FeedController(mixedFeedHandler);
const discoveryRoutes = createDiscoveryRoutes(feedController);

// Initialize Cron Jobs
initCrons().catch(console.error);

const app = new Elysia()
  .use(swagger())
  .use(cors())
  .get('/', () => 'Hello Metacult API (Elysia)')
  .get('/health', () => ({ status: 'ok', timestamp: new Date().toISOString() }))
  // Mount Routes
  .use(authRoutes)
  .group('/api', (app) => app
    .group('/import', (app) => app.use(importRoutes))
    .use(catalogRoutesRouter)
    .use(discoveryRoutes)
  );

const port = Number(process.env.PORT) || 3000;

app.listen({
  port,
  hostname: '0.0.0.0'
});

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
