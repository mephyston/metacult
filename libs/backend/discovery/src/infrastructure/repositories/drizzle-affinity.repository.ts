import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';
import type { AffinityRepository } from '../../domain/ports/affinity.repository.interface';
import { Affinity } from '../../domain/entities/affinity.entity';
import { userMediaAffinity } from '../db/user_media_affinity.schema';
import * as schema from '../db/schema';

export class DrizzleAffinityRepository implements AffinityRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async save(affinity: Affinity): Promise<void> {
    await this.db
      .insert(userMediaAffinity)
      .values({
        userId: affinity.userId,
        mediaId: affinity.mediaId,
        score: affinity.score,
        lastUpdated: affinity.lastUpdated,
      })
      .onConflictDoUpdate({
        target: [userMediaAffinity.userId, userMediaAffinity.mediaId],
        set: {
          score: affinity.score,
          lastUpdated: affinity.lastUpdated,
        },
      });
  }

  async findByUserAndMedia(
    userId: string,
    mediaId: string,
  ): Promise<Affinity | null> {
    const result = await this.db
      .select()
      .from(userMediaAffinity)
      .where(
        and(
          eq(userMediaAffinity.userId, userId),
          eq(userMediaAffinity.mediaId, mediaId),
        ),
      )
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    if (!row) {
      return null;
    }
    return new Affinity({
      userId: row.userId,
      mediaId: row.mediaId,
      score: row.score,
      lastUpdated: row.lastUpdated,
    });
  }

  async findByUser(userId: string): Promise<Affinity[]> {
    const results = await this.db
      .select()
      .from(userMediaAffinity)
      .where(eq(userMediaAffinity.userId, userId));

    return results.map(
      (row) =>
        new Affinity({
          userId: row.userId,
          mediaId: row.mediaId,
          score: row.score,
          lastUpdated: row.lastUpdated,
        }),
    );
  }

  async findAllUsersWithAffinity(): Promise<string[]> {
    const result = await this.db
      .selectDistinct({ userId: userMediaAffinity.userId })
      .from(userMediaAffinity);
    return result.map((r) => r.userId);
  }

  async findCandidateNeighbors(
    userId: string,
    minSharedInteractions = 3,
    minScore = 1200,
  ): Promise<string[]> {
    /*
     SQL Logic moved from ComputeNeighborsService:
     SELECT
         b.user_id as neighbor_id,
         COUNT(*) as shared_count
     FROM user_media_affinity a
     JOIN user_media_affinity b ON a.media_id = b.media_id AND a.user_id != b.user_id
     WHERE
         a.user_id = ${userId}
         AND a.score > 1200
         AND b.score > 1200
     GROUP BY b.user_id
     HAVING COUNT(*) >= 3
    */
    // We need raw SQL for the self-join/complex condition or use Drizzle's query builder if possible.
    // Using `sql` tag is cleaner for this specific complex join.
    // Accessing the table name directly or via sql interpolation.

    const candidatesQuery = sql`
        SELECT 
            b.user_id as neighbor_id
        FROM ${userMediaAffinity} a
        JOIN ${userMediaAffinity} b ON a.media_id = b.media_id AND a.user_id != b.user_id
        WHERE 
            a.user_id = ${userId} 
            AND a.score > ${minScore} 
            AND b.score > ${minScore}
        GROUP BY b.user_id
        HAVING COUNT(*) >= ${minSharedInteractions}
    `;

    const result = await this.db.execute(candidatesQuery);
    return result.rows.map(
      (r: unknown) => (r as { neighbor_id: string }).neighbor_id,
    );
  }
}
