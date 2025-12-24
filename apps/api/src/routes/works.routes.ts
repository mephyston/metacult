import { getDbConnection, DrizzleWorkRepository } from '@metacult/backend/infrastructure';
import { ExploreWorksUseCase } from '@metacult/backend/application';
import { WorkType } from '@metacult/backend/domain';
import { t, Elysia } from 'elysia';

console.log('Registering Real Works Routes...');

// Setup DB connection
const { db } = getDbConnection();

// Instantiate dependencies
const workRepository = new DrizzleWorkRepository(db as any);
const exploreWorksUseCase = new ExploreWorksUseCase(workRepository);

export const worksRoutes = new Elysia({ prefix: '/works' })
    .get('', async ({ query }) => {
        const works = await exploreWorksUseCase.execute({
            search: query.q,
            type: query.type as WorkType,
            tag: query.tag,
        });
        return works;
    }, {
        query: t.Object({
            q: t.Optional(t.String()),
            type: t.Optional(t.Enum(WorkType)),
            tag: t.Optional(t.String()),
        })
    });
