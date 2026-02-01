import { Elysia } from 'elysia';
import { FeedController } from './http/controllers/feed.controller';

/**
 * Crée le routeur Elysia pour le module Discovery.
 * Expose l'endpoint `/feed`.
 *
 * @param {FeedController} feedController - Contrôleur injecté.
 * @returns {Elysia} Routeur configuré.
 */
export const createDiscoveryRoutes = (feedController: FeedController) =>
  new Elysia({ prefix: '/discovery' }).use(feedController.routes());
