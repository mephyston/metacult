import { getDbConnection, DrizzleMediaRepository } from '@metacult/backend/infrastructure';
import { ExploreMediaUseCase } from '@metacult/backend/application';
import { MediaType } from '@metacult/backend/domain';
import { t, Elysia } from 'elysia';

console.log('Registering Real Works Routes...');

// Setup DB connection
const { db } = getDbConnection();

// Instantiate dependencies
const mediaRepository = new DrizzleMediaRepository(db as any);
const exploreMediaUseCase = new ExploreMediaUseCase(mediaRepository);

export const mediaRoutes = new Elysia({ prefix: '/media' })
    .get('', async ({ query }) => {
        const works = await exploreMediaUseCase.execute({
            search: query.q,
            type: query.type as MediaType,
            tag: query.tag,
        });
        return works;
    }, {
        query: t.Object({
            q: t.Optional(t.String()),
            type: t.Optional(t.Enum(MediaType)),
            tag: t.Optional(t.String()),
        })
    });
