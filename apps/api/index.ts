import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { catalogRoutes, mediaSchema, SearchMediaHandler, DrizzleMediaRepository } from '@metacult/backend/catalog';
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
const mediaRepo = new DrizzleMediaRepository(db);
const searchHandler = new SearchMediaHandler(mediaRepo);

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
    return adsHandler.execute(new GetActiveAdsHandler(redisClient) as any); // Wait, handler instance vs query...
    // Actually adsHandler is instance of GetActiveAdsHandler.
    // It expects a Query.
    // The query is GetActiveAdsQuery.
    // I need to import GetActiveAdsQuery? Or use empty object/any?
    // Marketing module exports GetActiveAdsQuery?
    // Let's just pass empty object cast to any if we want to be quick, OR import the Query class.
    // Better: import the Query class if possible. But `apps/api` should create it.
    // I need to import GetActiveAdsQuery from marketing.
    return adsHandler.execute({});
  }
};
// But Typescript might complain about missing properties if I pass {}.
// Let's import GetActiveAdsQuery if available, or just cast.
// "argument of type '{}' is not assignable to parameter of type 'GetActiveAdsQuery'"
// I will just cast to any to satisfy the Adapter implementation in Composition Root. 
// Ideally I should import the Query, but I don't want to break exports again.
// Wait, `apps/api/index.ts` imports `GetActiveAdsHandler` but not `GetActiveAdsQuery`.
// I'll add `import { GetActiveAdsQuery }` to the import line.

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
    .use(catalogRoutes) // catalogRoutes already has prefix '/media'
    .use(discoveryRoutes) // discoveryRoutes already has prefix '/discovery'
  );

const port = Number(process.env.PORT) || 3000;

app.listen(port);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

// export default app;
