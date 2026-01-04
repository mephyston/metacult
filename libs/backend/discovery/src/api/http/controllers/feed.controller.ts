/* eslint-disable */
import { Elysia } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';
import { logger } from '@metacult/backend-infrastructure';

import type { IInteractionRepository } from '@metacult/backend-interaction';

import { auth } from '@metacult/backend-identity';

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
      .derive(async ({ headers }) => {
        // Récupère la session depuis les headers (Cookie ou Authorization Bearer)
        const sessionData = await auth.api.getSession({
          headers: headers as HeadersInit,
        });

        // Injecte user et session dans le contexte (ou null si pas authentifié)
        return {
          user: sessionData?.user || null,
          session: sessionData?.session || null,
        };
      })
      .get('/', async (context) => {
        const { user, query } = context as any; // Type assertion needed for user
        const searchTerm = query?.q || '';
        const excludedIdsParam = query?.excludedIds || '';
        const userId = user?.id;

        logger.info(
          {
            userId: userId || 'Guest',
            search: searchTerm,
            hasExcludedIds: !!excludedIdsParam,
          },
          '[FeedController] GET /feed',
        );

        let excludedMediaIds: string[] = [];
        let limit = 5; // Default (Guest)

        if (userId) {
          // User logic: Fetch from DB
          try {
            excludedMediaIds =
              await this.interactionRepository.getSwipedMediaIds(userId);
            logger.debug(
              {
                count: excludedMediaIds.length,
                sample: excludedMediaIds.slice(0, 3),
              },
              '[FeedController] Excluded media IDs from DB',
            );
          } catch (e) {
            logger.error(
              { err: e },
              '[FeedController] Failed to fetch blacklist',
            );
          }
          limit = 10;
        } else if (excludedIdsParam) {
          // Guest with client-side exclusions
          excludedMediaIds = excludedIdsParam
            .split(',')
            .map((id: string) => id.trim())
            .filter((id: string) => id.length > 0);
          logger.debug(
            { count: excludedMediaIds.length },
            '[FeedController] Guest mode - excludedIds from client',
          );
        } else {
          logger.debug('[FeedController] Guest mode - no exclusions');
        }

        // Create Query with Context
        const feedQuery = new GetMixedFeedQuery(
          searchTerm,
          userId,
          excludedMediaIds,
          limit,
        );

        const feed = await this.getMixedFeedHandler.execute(feedQuery);
        logger.info({ count: feed.length }, '[FeedController] Returning items');
        return feed;
      });
  }
}
