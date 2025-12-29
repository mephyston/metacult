import { getDbConnection } from '@metacult/backend/infrastructure';
import { cacheService } from '../../../../../infrastructure/src/lib/cache/cache.service';
import { GetMixedFeedQuery } from '../../application/queries/get-mixed-feed/get-mixed-feed.query';
import { GetMixedFeedHandler } from '../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { SearchMediaHandler, DrizzleMediaRepository } from '@metacult/backend/catalog';
import { GetActiveAdsHandler } from '@metacult/backend/marketing';
import * as mediaSchema from '@metacult/backend/catalog';
// Note: schema import might need adjustment if catalog exports changed

import { Elysia, t } from 'elysia';

// Instantiate Dependencies
const { db } = getDbConnection(mediaSchema);
const mediaRepository = new DrizzleMediaRepository(db as any);
const searchMediaHandler = new SearchMediaHandler(mediaRepository);
const adsHandler = new GetActiveAdsHandler(redisClient);

const getMixedFeedHandler = new GetMixedFeedHandler(
    redisClient,
    searchMediaHandler,
    adsHandler
);

export const discoveryRoutes = new Elysia({ prefix: '/discovery' })
    .get('/feed', async ({ query }) => {
        const result = await getMixedFeedHandler.execute(
            new GetMixedFeedQuery(query.q || '')
        );
        return result;
    }, {
        query: t.Object({
            q: t.Optional(t.String())
        })
    });
