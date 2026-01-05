import { Elysia, t } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';
import { logger } from '@metacult/backend-infrastructure';

import { GetPersonalizedFeedHandler } from '../../../application/queries/get-personalized-feed/get-personalized-feed.handler';
import { GetPersonalizedFeedQuery } from '../../../application/queries/get-personalized-feed/get-personalized-feed.query';

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IInteractionRepository } from '@metacult/backend-interaction';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { auth, isAuthenticated } from '@metacult/backend-identity';

/**
 * Contrôleur HTTP pour le flux de découverte (Feed).
 * Expose les endpoints liés à l'exploration du catalogue (Mixed Feed).
 */
export class FeedController {
  constructor(
    private readonly getMixedFeedHandler: GetMixedFeedHandler,
    private readonly getPersonalizedFeedHandler: GetPersonalizedFeedHandler,
    private readonly interactionRepository: IInteractionRepository,
  ) {}

  /**
   * Routes definition to be mounted by Elysia
   */
  public routes() {
    return (
      new Elysia({ prefix: '/feed' })
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
            // ... (Existing Logic for Mixed Feed) ...
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

            let limit = query.limit;
            if (!limit) {
              limit = userId ? 10 : 5;
            }

            if (userId) {
              try {
                const dbExcluded =
                  await this.interactionRepository.getSwipedMediaIds(userId);
                excludedMediaIds = [
                  ...new Set([...dbExcluded, ...excludedIdsParam]),
                ];
              } catch (e) {
                logger.error(
                  { err: e },
                  '[FeedController] Failed to fetch blacklist',
                );
                excludedMediaIds = excludedIdsParam;
              }
            } else {
              excludedMediaIds = excludedIdsParam;
            }

            const feedQuery = new GetMixedFeedQuery(
              searchTerm,
              userId,
              excludedMediaIds,
              limit,
            );

            const feed = await this.getMixedFeedHandler.execute(feedQuery);
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
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                  .Encode((value: string[]) => value.join(',')),
              ),
              limit: t.Optional(t.Numeric()),
            }),
          },
        )
        // --- Protected Routes ---
        .use(isAuthenticated)
        .get(
          '/personalized',
          async ({ query, user }) => {
            // User is guaranteed by isAuthenticated middleware
            const limit = query.limit || 20;
            const offset = query.offset || 0;

            const feedQuery = new GetPersonalizedFeedQuery(
              user.id,
              limit,
              offset,
            );
            const feed =
              await this.getPersonalizedFeedHandler.execute(feedQuery);

            return feed;
          },
          {
            query: t.Object({
              limit: t.Optional(t.Numeric()),
              offset: t.Optional(t.Numeric()),
            }),
            detail: {
              summary: 'Get personalized feed based on user neighbors',
              tags: ['Feed'],
            },
          },
        )
    );
  }
}
