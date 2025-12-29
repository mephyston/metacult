import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { catalogRoutes, mediaSchema } from '@metacult/backend/catalog';
import { discoveryRoutes } from '@metacult/backend/discovery';
import { authRoutes } from './src/routes/auth.routes';
import { importRoutes } from './src/routes/import.routes';
import { getDbConnection } from '@metacult/backend/infrastructure';
import * as infraSchema from '@metacult/backend/infrastructure';
import { initCrons } from './src/cron/cron.service';

// Initialize DB (Composition Root)
// Merge schemas to ensure DB client satisfies all module requirements
const fullSchema = { ...infraSchema, ...mediaSchema };
// Initialize Singleton
getDbConnection(fullSchema);

console.log('🚀 Initializing API (Elysia)...');
console.log('🔌 Connecting to Database...');

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
