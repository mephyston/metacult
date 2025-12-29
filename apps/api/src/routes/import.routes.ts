import { Elysia, t } from 'elysia';
import { importQueue } from '@metacult/backend/infrastructure';

// Routes are prefixed in the mounting file (e.g. /api/import)

const app = new Elysia()
    .post('/games/:id', async ({ params: { id } }) => {
        const jobId = `game-${id}-${Date.now()}`;
        await importQueue.add('import-game', {
            type: 'game',
            id
        }, { jobId });

        return { status: 'queued', type: 'game', id, jobId };
    }, {
        params: t.Object({
            id: t.String({ minLength: 1 })
        })
    })
    .post('/movies/:id', async ({ params: { id } }) => {
        const jobId = `movie-${id}-${Date.now()}`;
        await importQueue.add('import-movie', {
            type: 'movie',
            id
        }, { jobId });

        return { status: 'queued', type: 'movie', id, jobId };
    }, {
        params: t.Object({
            id: t.String({ minLength: 1 })
        })
    })
    .post('/tv/:id', async ({ params: { id } }) => {
        const jobId = `tv-${id}-${Date.now()}`;
        await importQueue.add('import-tv', {
            type: 'tv',
            id
        }, { jobId });

        return { status: 'queued', type: 'tv', id, jobId };
    }, {
        params: t.Object({
            id: t.String({ minLength: 1 })
        })
    })
    .post('/books/:id', async ({ params: { id } }) => {
        const jobId = `book-${id}-${Date.now()}`;
        await importQueue.add('import-book', {
            type: 'book',
            id
        }, { jobId });

        return { status: 'queued', type: 'book', id, jobId };
    }, {
        params: t.Object({
            id: t.String({ minLength: 1 })
        })
    });

export const importRoutes = app;
