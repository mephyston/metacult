console.log('🚀 Initializing API...');
import { Elysia } from 'elysia';
import { worksRoutes } from './src/routes/works.routes';

const app = new Elysia()
  .use(worksRoutes)
  .get('/', () => 'Hello Metacult API')
  .listen({
    port: Number(process.env.PORT) || 3333,
    hostname: '0.0.0.0'
  });

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
