/* eslint-disable */
import { Elysia } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';

import type { IInteractionRepository } from '@metacult/backend/interaction';

import { isAuthenticated } from '@metacult/backend-identity';

/**
 * Contrôleur HTTP pour le flux de découverte (Feed).
 * Expose les endpoints liés à l'exploration du catalogue (Mixed Feed).
 */
export class FeedController {
  constructor(
    private readonly getMixedFeedHandler: GetMixedFeedHandler,
    private readonly interactionRepository: IInteractionRepository,
  ) {}

  /**
   * Routes definition to be mounted by Elysia
   */
  public routes() {
    return new Elysia({ prefix: '/feed' })
      .use(isAuthenticated) // Adds user to context (optional or required depending on config, here we handle both)
      .get('/', async (context) => {
        const { user, query } = context as any; // Type assertion needed for user
        const searchTerm = query?.q || '';
        const userId = user?.id;

        console.log(
          '[FeedController] GET /feed - User:',
          userId || 'Guest',
          'Search:',
          searchTerm,
        );

        let excludedMediaIds: string[] = [];
        let limit = 5; // Default (Guest)

        if (userId) {
          // User logic
          try {
            excludedMediaIds =
              await this.interactionRepository.getSwipedMediaIds(userId);
            console.log(
              '[FeedController] Excluded media IDs:',
              excludedMediaIds.length,
            );
          } catch (e) {
            console.error('[FeedController] Failed to fetch blacklist:', e);
          }
          limit = 10;
        }

        // Create Query with Context
        const feedQuery = new GetMixedFeedQuery(
          searchTerm,
          userId,
          excludedMediaIds,
          limit,
        );

        const feed = await this.getMixedFeedHandler.execute(feedQuery);
        console.log('[FeedController] Returning', feed.length, 'items');
        return feed;
      });
  }
}
