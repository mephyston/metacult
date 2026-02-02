import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, desc, and, eq } from 'drizzle-orm';
import { Result, InfrastructureError } from '@metacult/shared-core';
import type {
  IRecommendationRepository,
  FeedMediaDto,
} from '../../domain/ports/recommendation.repository.interface';
import { userSimilarity, userMediaAffinity } from '../db/schema';
import { mediaSchema } from '@metacult/backend-catalog';

const { medias } = mediaSchema; // Assuming we can use catalog schema in Discovery Infra if Catalog is a Lib?
// Actually, Discovery depending on Catalog DB Schema is a shared-database pattern or monolith shortcut.
// If strict, Discovery might need its own view or duplicate definition.
// For now, depending on Catalog Schema in Infra layer is acceptable (Infra -> Infra dependency),
// BUT imports from '@metacult/backend-catalog' usually point to index.ts which might export everything.
// Audit warned Handler -> Schema. Infra -> Schema is fine.

export class DrizzleRecommendationRepository
  implements IRecommendationRepository
{
  constructor(private readonly db: NodePgDatabase<Record<string, unknown>>) {}

  async getPersonalizedRecommendations(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<Result<FeedMediaDto[]>> {
    try {
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
          coverUrl: sql<string>`${medias.providerMetadata} ->> 'coverUrl'`,
          rankScore:
            sql<number>`SUM(${userMediaAffinity.score} * ${userSimilarity.similarityScore})`.as(
              'rank_score',
            ),
        })
        .from(userSimilarity)
        .innerJoin(
          userMediaAffinity,
          eq(userSimilarity.neighborId, userMediaAffinity.userId),
        )
        .innerJoin(medias, eq(userMediaAffinity.mediaId, medias.id))
        .where(
          and(
            eq(userSimilarity.userId, userId),
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
        new InfrastructureError(
          error instanceof Error ? error.message : 'Unknown error',
        ),
      );
    }
  }
}
