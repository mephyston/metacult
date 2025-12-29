console.log('🚀 Initializing API...');
import { Elysia } from 'elysia';
import { worksRoutes } from './src/routes/works.routes';
import { authRoutes } from './src/routes/auth.routes';
import { getDbConnection } from '@metacult/backend/infrastructure';

try {
  console.log('🔌 Connecting to Database...');
  const { db } = getDbConnection();

  console.log('🔌 Connecting to Database...');
  const { db } = getDbConnection();


  const app = new Elysia()
    .use(worksRoutes)
    .use(authRoutes)
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
