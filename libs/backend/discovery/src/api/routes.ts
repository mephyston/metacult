import { Elysia, t } from 'elysia';
import { feedController } from '../infrastructure/di';

export const discoveryRoutes = new Elysia({ prefix: '/discovery' })
    .get('/feed', ({ query }) => feedController.getFeed({ query } as any), {
        query: t.Object({
            q: t.Optional(t.String({ maxLength: 100 }))
        })
    });
