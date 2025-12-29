import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { mediaRoutes } from '@metacult/backend/catalog';
import { discoveryRoutes } from '@metacult/backend/discovery';
import { authRoutes } from './src/routes/auth.routes';
import { importRoutes } from './src/routes/import.routes';
import { getDbConnection } from '@metacult/backend/infrastructure';
import * as schema from '@metacult/backend/infrastructure';
import { initCrons } from './src/cron/cron.service';

// Initialize DB (Composition Root)
const { db } = getDbConnection(schema);

try {
  console.log('🚀 Initializing API...');
  console.log('🔌 Connecting to Database...');

  // Initialize Cron Jobs
  initCrons().catch(console.error);

  const app = new Elysia()
    .use(mediaRoutes)
    .use(authRoutes)
    .use(importRoutes)
    .get('/', () => 'Hello Metacult API')
    .listen({
      port: Number(process.env.PORT) || 3333,
      hostname: '0.0.0.0'
    });

  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

} catch (error) {
  console.error('❌ Failed to start API due to DB/Migration error:', error);
  process.exit(1);
}
