import { Elysia, t } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';
import { logger } from '@metacult/backend-infrastructure';

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IInteractionRepository } from '@metacult/backend-interaction';

// eslint-disable-next-line @nx/enforce-module-boundaries
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
      .get(
        '/',
        async ({ query, user }) => {
          const searchTerm = query.q || '';
          const userId = user?.id;
          const excludedIdsParam = query.excludedIds || [];

          logger.info(
            {
              userId: userId || 'Guest',
              search: searchTerm,
              hasExcludedIds: excludedIdsParam.length > 0,
            },
            '[FeedController] GET /feed',
          );

          let excludedMediaIds: string[] = [];

          // Determine Limit: Query > User (10) > Guest (5)
          let limit = query.limit;
          if (!limit) {
            limit = userId ? 10 : 5;
          }

          if (userId) {
            // User logic: Fetch from DB (server-side blacklist)
            try {
              const dbExcluded =
                await this.interactionRepository.getSwipedMediaIds(userId);
              excludedMediaIds = [
                ...new Set([...dbExcluded, ...excludedIdsParam]),
              ]; // Merge DB + Client exclusions if any

              logger.debug(
                {
                  count: excludedMediaIds.length,
                  sample: excludedMediaIds.slice(0, 3),
                },
                '[FeedController] Excluded media IDs (DB + Client)',
              );
            } catch (e) {
              logger.error(
                { err: e },
                '[FeedController] Failed to fetch blacklist',
              );
              // Fallback to just client params if DB fails
              excludedMediaIds = excludedIdsParam;
            }
          } else {
            // Guest with client-side exclusions only
            excludedMediaIds = excludedIdsParam;
            if (excludedMediaIds.length > 0) {
              logger.debug(
                { count: excludedMediaIds.length },
                '[FeedController] Guest mode - excludedIds from client',
              );
            } else {
              logger.debug('[FeedController] Guest mode - no exclusions');
            }
          }

          // Create Query with Context
          const feedQuery = new GetMixedFeedQuery(
            searchTerm,
            userId,
            excludedMediaIds,
            limit,
          );

          const feed = await this.getMixedFeedHandler.execute(feedQuery);
          logger.info(
            { count: feed.length },
            '[FeedController] Returning items',
          );
          return feed;
        },
        {
          query: t.Object({
            q: t.Optional(t.String()),
            excludedIds: t.Optional(
              t
                .Transform(t.String())
                .Decode((value: string) =>
                  value
                    .split(',')
                    .map((s: string) => s.trim())
                    .filter(Boolean),
                )
                .Encode((value: string[]) => value.join(',')),
            ),
            limit: t.Optional(t.Numeric()),
          }),
        },
      );
  }
}
