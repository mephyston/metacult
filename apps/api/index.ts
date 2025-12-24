import { Elysia } from 'elysia';
import { worksRoutes } from './src/routes/works.routes';

const app = new Elysia()
  .use(worksRoutes)
  .get('/', () => 'Hello Metacult API')
  .listen(3333);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
