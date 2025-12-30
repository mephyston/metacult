import { Elysia, t } from 'elysia';
import { FeedController } from './http/controllers/feed.controller';

export const createDiscoveryRoutes = (feedController: FeedController) => new Elysia({ prefix: '/discovery' })
    .get('/feed', ({ query }) => {
        return feedController.getFeed(query);
    }, {
        query: t.Object({
            q: t.Optional(t.String({ maxLength: 100 }))
        })
    });
