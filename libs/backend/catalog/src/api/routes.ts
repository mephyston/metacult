import { Elysia, t } from 'elysia';
import { mediaController } from '../infrastructure/di';

const MediaTypeEnum = t.Union([
    t.Literal('game'),
    t.Literal('movie'),
    t.Literal('tv'),
    t.Literal('book'),
]);

export const catalogRoutes = new Elysia({ prefix: '/media' })
    .get('/search', ({ query }) => {
        return mediaController.search({ query } as any); // Use 'as any' for now to bypass strict DTO mismatch, validation is handled runtime
    }, {
        query: t.Object({
            q: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            type: t.Optional(MediaTypeEnum),
            tag: t.Optional(t.String({ pattern: '^[a-z0-9-]+$' })),
        })
    })
    .post('/import', ({ body }) => {
        return mediaController.import({ body } as any);
    }, {
        body: t.Object({
            mediaId: t.String({ minLength: 1 }),
            type: MediaTypeEnum,
        })
    });
