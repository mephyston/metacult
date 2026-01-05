import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, sql } from 'drizzle-orm';
import type { SimilarityRepository } from '../../domain/ports/similarity.repository.interface';
import { Neighbor } from '../../domain/entities/neighbor.entity';
import { userSimilarity } from '../db/user_similarity.schema';
import * as schema from '../db/schema';

export class DrizzleSimilarityRepository implements SimilarityRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async save(neighbor: Neighbor): Promise<void> {
    await this.db
      .insert(userSimilarity)
      .values({
        userId: neighbor.userId,
        neighborId: neighbor.neighborId,
        similarityScore: neighbor.similarityScore,
        lastUpdated: neighbor.lastUpdated,
      })
      .onConflictDoUpdate({
        target: [userSimilarity.userId, userSimilarity.neighborId],
        set: {
          similarityScore: neighbor.similarityScore,
          lastUpdated: neighbor.lastUpdated,
        },
      });
  }

  async getNeighbors(userId: string): Promise<Neighbor[]> {
    const results = await this.db
      .select()
      .from(userSimilarity)
      .where(eq(userSimilarity.userId, userId))
      .orderBy(sql`${userSimilarity.similarityScore} DESC`);

    return results.map(
      (r) =>
        new Neighbor(r.userId, r.neighborId, r.similarityScore, r.lastUpdated),
    );
  }
}
