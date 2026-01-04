import { sql, eq, and, or, inArray } from 'drizzle-orm';
import { Media, mediaSchema } from '@metacult/backend-catalog';
import { userInteractions } from '@metacult/backend-interaction';
import { getDbConnection } from '@metacult/backend-infrastructure';
import type { DuelRepository } from '../../application/ports/duel.repository.interface';

/**
 * Implémentation Drizzle du DuelRepository.
 */
export class DrizzleDuelRepository implements DuelRepository {
  async getRandomPairForUser(userId: string): Promise<Media[]> {
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
      return rows.map((row: any) => row.medias) as unknown as Media[];
    }

    const rawMedias = rows.map((row: any) => row.medias);

    return rawMedias.map((m: any) => ({
      ...m,
      coverUrl:
        m.providerMetadata?.coverUrl || m.providerMetadata?.posterUrl || null,
    })) as unknown as Media[];
  }
}
