import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { createCatalogRoutes, CatalogModuleFactory, mediaSchema } from '@metacult/backend/catalog';
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

// --- COMPOSITION ROOT ---

// 1. Catalog Module
// Use Factory to encapsulate implementation details (Providers, Repositories)
const catalogController = CatalogModuleFactory.createController(db);
const catalogRoutesRouter = createCatalogRoutes(catalogController);

// Need pure handlers for Discovery adapter?
// The factory creates new instances every time. Ideally we should singleton them or expose them.
// But for now, creating new instances for Discovery adapter is acceptable or we can just use the controller methods if possible?
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
  // Mount Routes
  .use(authRoutes)
  .group('/api', (app) => app
    .group('/import', (app) => app.use(importRoutes))
    .use(catalogRoutesRouter)
    .use(discoveryRoutes)
  );

const port = Number(process.env.PORT) || 3000;

app.listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
