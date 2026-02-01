import { sql, eq, and, or, inArray } from 'drizzle-orm';
import { mediaSchema } from '@metacult/backend-catalog';
import { userInteractions } from '@metacult/backend-interaction';
import { getDbConnection } from '@metacult/backend-infrastructure';
import type { DuelRepository } from '../../application/ports/duel.repository.interface';
import type { RankedMedia } from '../../domain/types/ranked-media.type';

/**
 * Implémentation Drizzle du DuelRepository.
 */
export class DrizzleDuelRepository implements DuelRepository {
  async getRandomPairForUser(userId: string): Promise<RankedMedia[]> {
    const { db } = getDbConnection();

    // On récupère les médias "aimés" par l'utilisateur (LIKE/WISHLIST ou Sentiment positif)
    // Et on en prend 2 au hasard.
    const rows = await db
      .select()
      .from(mediaSchema.medias)
      .innerJoin(
        userInteractions,
        eq(mediaSchema.medias.id, userInteractions.mediaId),
      )
      .where(
        and(
          eq(userInteractions.userId, userId),
          or(
            eq(userInteractions.action, 'LIKE'),
            eq(userInteractions.action, 'WISHLIST'),
            inArray(userInteractions.sentiment, ['BANGER', 'GOOD']),
          ),
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(2);

    if (rows.length < 2) {
      return rows.map((row) => ({
        ...row.medias,
        providerMetadata: row.medias.providerMetadata as Record<
          string,
          unknown
        > | null,
        coverUrl: this.extractCoverUrl(row.medias.providerMetadata),
      })) as RankedMedia[];
    }

    const rawMedias = rows.map((row) => row.medias);

    return rawMedias.map((m) => ({
      ...m,
      providerMetadata: m.providerMetadata as Record<string, unknown> | null,
      coverUrl: this.extractCoverUrl(m.providerMetadata),
    })) as RankedMedia[];
  }

  private extractCoverUrl(metadata: unknown): string | null {
    if (!metadata || typeof metadata !== 'object') return null;
    const meta = metadata as { coverUrl?: unknown; posterUrl?: unknown };
    if (typeof meta.coverUrl === 'string') return meta.coverUrl;
    if (typeof meta.posterUrl === 'string') return meta.posterUrl;
    return null;
  }

  async findById(id: string): Promise<RankedMedia | undefined> {
    const { db } = getDbConnection();
    const rows = await db
      .select()
      .from(mediaSchema.medias)
      .where(eq(mediaSchema.medias.id, id))
      .limit(1);

    if (!rows.length) {
      return undefined;
    }

    const m = rows[0]!;
    return {
      ...m,
      providerMetadata: m.providerMetadata as Record<string, unknown> | null,
      coverUrl: this.extractCoverUrl(m.providerMetadata),
    } as RankedMedia;
  }

  async updateEloScores(
    winnerId: string,
    winnerNewElo: number,
    loserId: string,
    loserNewElo: number,
  ): Promise<void> {
    const { db } = getDbConnection();

    await db.transaction(async (tx) => {
      // Update Winner
      await tx
        .update(mediaSchema.medias)
        .set({
          eloScore: winnerNewElo,
          matchCount: sql`${mediaSchema.medias.matchCount} + 1`,
        })
        .where(eq(mediaSchema.medias.id, winnerId));

      // Update Loser
      await tx
        .update(mediaSchema.medias)
        .set({
          eloScore: loserNewElo,
          matchCount: sql`${mediaSchema.medias.matchCount} + 1`,
        })
        .where(eq(mediaSchema.medias.id, loserId));
    });
  }
}
