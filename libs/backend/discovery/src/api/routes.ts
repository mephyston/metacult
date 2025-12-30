import { Elysia, t } from 'elysia';
import { FeedController } from './http/controllers/feed.controller';

/**
 * Crée le routeur Elysia pour le module Discovery.
 * Expose l'endpoint `/feed`.
 * 
 * @param {FeedController} feedController - Contrôleur injecté.
 * @returns {Elysia} Routeur configuré.
 */
export const createDiscoveryRoutes = (feedController: FeedController) => new Elysia({ prefix: '/discovery' })
    .get('/feed', ({ query }) => {
        return feedController.getMixedFeed({ q: query.q });
    }, {
        query: t.Object({
            q: t.Optional(t.String({ maxLength: 100 }))
        })
    });
