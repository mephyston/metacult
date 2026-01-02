import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import {
  EloCalculator,
  type RankingUpdateJob,
} from '@metacult/backend/ranking';
import { getDbConnection } from '@metacult/backend/infrastructure';
import { mediaSchema } from '@metacult/backend/catalog';

// Initialize Elo Service
const eloCalculator = new EloCalculator();

/**
 * Traite les mises à jour de classement ELO.
 *
 * 1. Récupère les scores actuels des deux médias.
 * 2. Calcule les nouveaux scores.
 * 3. Met à jour la base de données.
 */
export const processRankingUpdate = async (job: Job<RankingUpdateJob>) => {
  const { winnerId, loserId } = job.data;
  const { db } = getDbConnection();

  console.log(
    `🏆 [RankingProcessor] Processing duel: ${winnerId} (Win) vs ${loserId} (Loss)`,
  );

  // 1. Fetch Medias
  // Note: Drizzle executes queries in parallel if we don't await them sequentially
  const [winner, loser] = await Promise.all([
    db
      .select()
      .from(mediaSchema.medias)
      .where(eq(mediaSchema.medias.id, winnerId))
      .limit(1)
      .then((rows) => rows[0]),
    db
      .select()
      .from(mediaSchema.medias)
      .where(eq(mediaSchema.medias.id, loserId))
      .limit(1)
      .then((rows) => rows[0]),
  ]);

  if (!winner || !loser) {
    throw new Error(`Media not found: Winner=${!!winner}, Loser=${!!loser}`);
  }

  // 2. Calculate New Scores
  const { winnerNewElo, loserNewElo } = eloCalculator.calculateNewScores(
    winner.eloScore,
    loser.eloScore,
  );

  // 3. Update DB
  // We update match_count and elo_score
  await db.transaction(async (tx) => {
    await tx
      .update(mediaSchema.medias)
      .set({
        eloScore: winnerNewElo,
        matchCount: winner.matchCount + 1,
      })
      .where(eq(mediaSchema.medias.id, winnerId));

    await tx
      .update(mediaSchema.medias)
      .set({
        eloScore: loserNewElo,
        matchCount: loser.matchCount + 1,
      })
      .where(eq(mediaSchema.medias.id, loserId));
  });

  console.log(
    `✅ [RankingProcessor] Update Complete: "${winner.title}" (${winner.eloScore} -> ${winnerNewElo}) vs "${loser.title}" (${loser.eloScore} -> ${loserNewElo})`,
  );
};
