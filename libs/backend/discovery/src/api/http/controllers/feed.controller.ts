/* eslint-disable */
import { Elysia } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';

import type { IInteractionRepository } from '@metacult/backend/interaction';

import { maybeAuthenticated } from '@metacult/backend-identity';

/**
 * Contrôleur HTTP pour le flux de découverte (Feed).
 * Expose les endpoints liés à l'exploration du catalogue (Mixed Feed).
 */
export class FeedController {
  constructor(
    private readonly getMixedFeedHandler: GetMixedFeedHandler,
    private readonly interactionRepository: IInteractionRepository,
  ) {
    console.log(
      '[FeedController] 🔧 Constructor called, maybeAuthenticated middleware:',
      typeof maybeAuthenticated,
    );
  }

  /**
   * Routes definition to be mounted by Elysia
   */
  public routes() {
    console.log(
      '[FeedController] 🚀 routes() called, mounting maybeAuthenticated',
    );
    return new Elysia({ prefix: '/feed' })
      .use(maybeAuthenticated) // Adds user to context (null if guest)
      .get('/', async (context) => {
        const { user, query } = context as any; // Type assertion needed for user
        const searchTerm = query?.q || '';
        const excludedIdsParam = query?.excludedIds || '';
        const userId = user?.id;

        console.log(
          '[FeedController] GET /feed - User:',
          userId || 'Guest',
          'Search:',
          searchTerm,
          'ExcludedIds param:',
          excludedIdsParam ? excludedIdsParam.substring(0, 50) + '...' : 'none',
        );

        let excludedMediaIds: string[] = [];
        let limit = 5; // Default (Guest)

        if (userId) {
          // User logic: Fetch from DB
          try {
            excludedMediaIds =
              await this.interactionRepository.getSwipedMediaIds(userId);
            console.log(
              '[FeedController] Excluded media IDs from DB:',
              excludedMediaIds.length,
              excludedMediaIds.length > 0 ? excludedMediaIds.slice(0, 3) : '[]',
            );
          } catch (e) {
            console.error('[FeedController] Failed to fetch blacklist:', e);
          }
          limit = 10;
        } else if (excludedIdsParam) {
          // Guest with client-side exclusions
          excludedMediaIds = excludedIdsParam
            .split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);
          console.log(
            '[FeedController] Guest mode - excludedIds from client:',
            excludedMediaIds.length,
          );
        } else {
          console.log('[FeedController] Guest mode - no exclusions');
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
