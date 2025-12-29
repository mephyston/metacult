import { getDbConnection } from '../../../../infrastructure/src/lib/db/client';
import { cacheService } from '../../../../infrastructure/src/lib/cache/cache.service';
// import { getDbConnection } from '@metacult/backend/infrastructure';
import {
    MediaType,
} from '../../domain/entities/media.entity';
import { DrizzleMediaRepository } from '../repositories/drizzle-media.repository';
import { SearchMediaHandler } from '../../application/queries/search-media/search-media.handler';
import { SearchMediaQuery } from '../../application/queries/search-media/search-media.query';
import * as mediaSchema from '../db/media.schema';
import * as interactionsSchema from '../db/interactions.schema';
import { t, Elysia } from 'elysia';

console.log('Registering Real Works Routes...');

// Setup DB connection
const { db } = getDbConnection({ ...mediaSchema, ...interactionsSchema });

// Instantiate dependencies
const mediaRepository = new DrizzleMediaRepository(db as any);
const searchMediaHandler = new SearchMediaHandler(mediaRepository);

export const mediaRoutes = new Elysia({ prefix: '/media' })
    .get('', async ({ query }) => {
        const searchInput = new SearchMediaQuery(
            query.q,
            query.type as MediaType,
            query.tag
        );
        const works = await searchMediaHandler.execute(searchInput);
        return works;
    }, {
        query: t.Object({
            q: t.Optional(t.String()),
            type: t.Optional(t.Enum(MediaType)),
            tag: t.Optional(t.String()),
        })
    });
