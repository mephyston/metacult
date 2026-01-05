import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and } from 'drizzle-orm';
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
    return new Affinity(row.userId, row.mediaId, row.score, row.lastUpdated);
  }

  async findByUser(userId: string): Promise<Affinity[]> {
    const results = await this.db
      .select()
      .from(userMediaAffinity)
      .where(eq(userMediaAffinity.userId, userId));

    return results.map(
      (row) =>
        new Affinity(row.userId, row.mediaId, row.score, row.lastUpdated),
    );
  }
}
