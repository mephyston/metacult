import { Elysia, t } from 'elysia';
import { importQueue } from '@metacult/backend/infrastructure';

export const importRoutes = new Elysia({ prefix: '/import' })
    .post('/games/:id', async ({ params }) => {
        const jobId = `game-${params.id}-${Date.now()}`;
        await importQueue.add('import-game', {
            type: 'game',
            id: params.id
        }, { jobId });

        return { status: 'queued', type: 'game', id: params.id, jobId };
    }, {
        params: t.Object({ id: t.String() })
    })
    .post('/movies/:id', async ({ params }) => {
        const jobId = `movie-${params.id}-${Date.now()}`;
        await importQueue.add('import-movie', {
            type: 'movie',
            id: params.id
        }, { jobId });

        return { status: 'queued', type: 'movie', id: params.id, jobId };
    }, {
        params: t.Object({ id: t.String() })
    })
    .post('/tv/:id', async ({ params }) => {
        const jobId = `tv-${params.id}-${Date.now()}`;
        await importQueue.add('import-tv', {
            type: 'tv',
            id: params.id
        }, { jobId });

        return { status: 'queued', type: 'tv', id: params.id, jobId };
    }, {
        params: t.Object({ id: t.String() })
    })
    .post('/books/:id', async ({ params }) => {
        const jobId = `book-${params.id}-${Date.now()}`;
        await importQueue.add('import-book', {
            type: 'book',
            id: params.id
        }, { jobId });

        return { status: 'queued', type: 'book', id: params.id, jobId };
    }, {
        params: t.Object({ id: t.String() })
    });
