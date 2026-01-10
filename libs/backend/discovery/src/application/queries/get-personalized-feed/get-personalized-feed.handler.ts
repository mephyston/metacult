import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, desc, and, eq } from 'drizzle-orm';
import { GetPersonalizedFeedQuery } from './get-personalized-feed.query';
import {
  userSimilarity,
  userMediaAffinity,
} from '../../../infrastructure/db/schema';
import { mediaSchema } from '@metacult/backend-catalog';
import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

import { z } from 'zod';

// Destructure Zod schema
const { medias, selectMediaSchema } = mediaSchema;

export const FeedMediaSchema = selectMediaSchema
  .pick({
    id: true,
    title: true,
    slug: true,
    type: true,
  })
  .extend({
    coverUrl: z.string().nullable(),
    rankScore: z.number(),
  });

export type FeedMediaDto = z.infer<typeof FeedMediaSchema>;

export class GetPersonalizedFeedHandler {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async execute(
    query: GetPersonalizedFeedQuery,
  ): Promise<Result<FeedMediaDto[], AppError>> {
    try {
      const { userId, limit, offset } = query;

      // 1. Get IDs of media the user has already interacted with
      const seenMedia = this.db
        .select({ mediaId: userMediaAffinity.mediaId })
        .from(userMediaAffinity)
        .where(eq(userMediaAffinity.userId, userId));

      // 2. Complex Join & Rank Query
      const recommendations = await this.db
        .select({
          id: medias.id,
          title: medias.title,
          slug: medias.slug,
          type: medias.type,
          // Extract coverUrl directly from JSONB providerMetadata
          coverUrl: sql<string>`${medias.providerMetadata} ->> 'coverUrl'`,
          // Calculate Rank Score
          rankScore:
            sql<number>`SUM(${userMediaAffinity.score} * ${userSimilarity.similarityScore})`.as(
              'rank_score',
            ),
        })
        .from(userSimilarity)
        .innerJoin(
          userMediaAffinity,
          eq(userSimilarity.neighborId, userMediaAffinity.userId),
        ) // Join Neighbors' affinities
        .innerJoin(medias, eq(userMediaAffinity.mediaId, medias.id)) // Join Media Metadata
        .where(
          and(
            eq(userSimilarity.userId, userId), // My neighbors
            // Filter out seen media (Exclude if user has interaction)
            sql`${medias.id} NOT IN(${seenMedia})`,
          ),
        )
        .groupBy(medias.id)
        .orderBy(desc(sql`rank_score`))
        .limit(limit)
        .offset(offset);

      return Result.ok(
        recommendations.map((row) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          type: row.type,
          coverUrl: row.coverUrl,
          rankScore: Number(row.rankScore),
        })),
      );
    } catch (error) {
      return Result.fail(
        error instanceof AppError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }
}
