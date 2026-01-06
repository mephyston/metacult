import { Elysia, t } from 'elysia';
import { GetMixedFeedHandler } from '../../../application/queries/get-mixed-feed/get-mixed-feed.handler';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';
import { logger } from '@metacult/backend-infrastructure';

import { GetPersonalizedFeedHandler } from '../../../application/queries/get-personalized-feed/get-personalized-feed.handler';
import { GetPersonalizedFeedQuery } from '../../../application/queries/get-personalized-feed/get-personalized-feed.query';

// New Handlers
import { GetTrendingHandler } from '../../../application/queries/get-trending/get-trending.handler';
import { GetTrendingQuery } from '../../../application/queries/get-trending/get-trending.query';
import { GetHallOfFameHandler } from '../../../application/queries/get-hall-of-fame/get-hall-of-fame.handler';
import { GetHallOfFameQuery } from '../../../application/queries/get-hall-of-fame/get-hall-of-fame.query';
import { GetControversialHandler } from '../../../application/queries/get-controversial/get-controversial.handler';
import { GetControversialQuery } from '../../../application/queries/get-controversial/get-controversial.query';
import { GetUpcomingHandler } from '../../../application/queries/get-upcoming/get-upcoming.handler';
import { GetUpcomingQuery } from '../../../application/queries/get-upcoming/get-upcoming.query';
import { GetTopRatedByYearHandler } from '../../../application/queries/get-top-rated-by-year/get-top-rated-by-year.handler';
import { GetTopRatedByYearQuery } from '../../../application/queries/get-top-rated-by-year/get-top-rated-by-year.query';
// Entity Type
import { MediaType } from '@metacult/backend-catalog';

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { IInteractionRepository } from '@metacult/backend-interaction';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { auth, isAuthenticated } from '@metacult/backend-identity';

/**
 * Contrôleur HTTP pour le flux de découverte (Feed).
 * Expose les endpoints liés à l'exploration du catalogue (Mixed Feed + Specific Queries).
 */
export class FeedController {
  constructor(
    private readonly getMixedFeedHandler: GetMixedFeedHandler,
    private readonly getPersonalizedFeedHandler: GetPersonalizedFeedHandler,
    private readonly interactionRepository: IInteractionRepository,
    // New Injections
    private readonly getTrendingHandler: GetTrendingHandler,
    private readonly getHallOfFameHandler: GetHallOfFameHandler,
    private readonly getControversialHandler: GetControversialHandler,
    private readonly getUpcomingHandler: GetUpcomingHandler,
    private readonly getTopRatedByYearHandler: GetTopRatedByYearHandler,
  ) {}

  /**
   * Helper to map Entity MediaType to Application Query Type.
   * Catalog uses 'tv', Discovery Query uses 'SHOW'.
   * Catalog uses lowercase, Discovery Query uses uppercase.
   */
  private mapToQueryType(
    type?: MediaType,
  ): 'GAME' | 'MOVIE' | 'BOOK' | 'SHOW' | undefined {
    if (!type) return undefined;
    if (type === MediaType.TV) return 'SHOW';
    return type.toUpperCase() as any;
  }

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
        // --- NEW CATALOG QUERIES ---
        .get(
          '/trending',
          async ({ query }) => {
            const limit = query.limit || 10;
            const type = this.mapToQueryType(
              query.type as MediaType | undefined,
            );
            return this.getTrendingHandler.execute(
              new GetTrendingQuery(limit, type),
            );
          },
          {
            query: t.Object({
              limit: t.Optional(t.Numeric()),
              type: t.Optional(t.Enum(MediaType)),
            }),
            detail: { summary: 'Get trending media (last 7 days)' },
          },
        )
        .get(
          '/hall-of-fame',
          async ({ query }) => {
            const limit = query.limit || 10;
            const type = this.mapToQueryType(
              query.type as MediaType | undefined,
            );
            return this.getHallOfFameHandler.execute(
              new GetHallOfFameQuery(limit, type),
            );
          },
          {
            query: t.Object({
              limit: t.Optional(t.Numeric()),
              type: t.Optional(t.Enum(MediaType)),
            }),
            detail: { summary: 'Get Hall of Fame (High ELO + Matches)' },
          },
        )
        .get(
          '/controversial',
          async ({ query }) => {
            const limit = query.limit || 10;
            const type = this.mapToQueryType(
              query.type as MediaType | undefined,
            );
            return this.getControversialHandler.execute(
              new GetControversialQuery(limit, type),
            );
          },
          {
            query: t.Object({
              limit: t.Optional(t.Numeric()),
              type: t.Optional(t.Enum(MediaType)),
            }),
            detail: {
              summary: 'Get Controversial media (High Activity, Mid ELO)',
            },
          },
        )
        .get(
          '/upcoming',
          async ({ query }) => {
            const limit = query.limit || 10;
            const type = this.mapToQueryType(
              query.type as MediaType | undefined,
            );
            return this.getUpcomingHandler.execute(
              new GetUpcomingQuery(limit, type),
            );
          },
          {
            query: t.Object({
              limit: t.Optional(t.Numeric()),
              type: t.Optional(t.Enum(MediaType)),
            }),
            detail: { summary: 'Get Upcoming media (Future releases)' },
          },
        )
        .get(
          '/best-of/:year',
          async ({ params, query, set }) => {
            const year = params.year;
            const limit = query.limit || 10;
            const type = this.mapToQueryType(
              query.type as MediaType | undefined,
            );

            if (year < 1888 || year > 2100) {
              set.status = 400;
              return 'Invalid Year';
            }

            return this.getTopRatedByYearHandler.execute(
              new GetTopRatedByYearQuery(year, limit, type),
            );
          },
          {
            params: t.Object({
              year: t.Numeric(),
            }),
            query: t.Object({
              limit: t.Optional(t.Numeric()),
              type: t.Optional(t.Enum(MediaType)),
            }),
            detail: { summary: 'Get Best Rated media by specific year' },
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
