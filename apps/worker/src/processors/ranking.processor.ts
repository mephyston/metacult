import { Job } from 'bullmq';
import {
  EloCalculator,
  type RankingUpdateJob,
  UpdateEloScoreCommand,
  UpdateEloScoreHandler,
  DrizzleDuelRepository,
} from '@metacult/backend-ranking';

// Composition Root (Manual DI)
// Composition Root (Manual DI)
const eloCalculator = new EloCalculator();
const duelRepository = new DrizzleDuelRepository();
const updateEloScoreHandler = new UpdateEloScoreHandler(
  duelRepository,
  eloCalculator,
);

export const rankingProcessorDeps = {
  handler: updateEloScoreHandler,
};

/**
 * Traite les mises à jour de classement ELO.
 * Refactorisé pour Clean Architecture : Délègue à un Handler.
 */
export const processRankingUpdate = async (job: Job<RankingUpdateJob>) => {
  const { winnerId, loserId } = job.data;

  const command = new UpdateEloScoreCommand(winnerId, loserId);

  await rankingProcessorDeps.handler.execute(command);
};
