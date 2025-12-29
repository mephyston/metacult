import { Elysia } from 'elysia';
import { auth } from '@metacult/backend/infrastructure';

export const authRoutes = new Elysia({ prefix: '/api/auth' })
    .get('/session', async ({ request }) => {
        const session = await auth.api.getSession({
            headers: request.headers
        });
        return session;
    })
    .all('/*', ({ request }) => {
        return auth.handler(request);
    });
