import { Elysia, t } from 'elysia';
import type { MediaController } from './http/controllers/media.controller';

const MediaTypeEnum = t.Union([
    t.Literal('game'),
    t.Literal('movie'),
    t.Literal('tv'),
    t.Literal('book'),
]);

// ✅ Factory Pattern: Routes acceptent le controller en paramètre
export const createCatalogRoutes = (controller: MediaController) => {
    return new Elysia({ prefix: '/media' })
        .onError(({ code, error, set }) => {
            if (code === 'VALIDATION') {
                set.status = 400;
                return { message: 'Validation Error', details: error };
            }
        })
        .get('/search', ({ query }) => {
            return controller.search(query);
        }, {
            query: t.Object({
                q: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
                type: t.Optional(MediaTypeEnum),
                tag: t.Optional(t.String({ pattern: '^[a-z0-9-]+$' })),
            })
        })
        .post('/import', ({ body }) => {
            return controller.import(body);
        }, {
            body: t.Object({
                mediaId: t.String({ minLength: 1 }),
                type: MediaTypeEnum,
            })
        });
};
