import { Elysia } from 'elysia';
import { auth } from '@metacult/backend/infrastructure';

export const authRoutes = new Elysia()
    .get('/api/auth/session', async ({ request }) => {
        return await auth.api.getSession({
            headers: request.headers
        });
    })
    .all('/api/auth/*', ({ request }) => {
        return auth.handler(request);
    });
