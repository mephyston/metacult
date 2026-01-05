import { logger } from '@metacult/backend-infrastructure';
import type { DuelRepository } from '../ports/duel.repository.interface';
import { MediaNotFoundError } from '../../domain/errors/ranking.errors';
import { EloCalculator } from '../../domain/services/elo-calculator.service';
import { UpdateEloScoreCommand } from './update-elo-score.command';

/**
 * Handler pour la commande de mise à jour des scores ELO.
 * Contient toute la logique métier : récupération, calcul, persistance.
 */
export class UpdateEloScoreHandler {
  constructor(
    private readonly duelRepository: DuelRepository,
    private readonly eloCalculator: EloCalculator,
  ) {}

  async execute(command: UpdateEloScoreCommand): Promise<void> {
    const { winnerId, loserId } = command;

    logger.info(
      { winnerId, loserId },
      '🏆 [UpdateEloScoreHandler] Processing duel',
    );

    // 1. Fetch Medias
    const [winner, loser] = await Promise.all([
      this.duelRepository.findById(winnerId),
      this.duelRepository.findById(loserId),
    ]);

    if (!winner || !loser) {
      const missingIds = [];
      if (!winner) missingIds.push(winnerId);
      if (!loser) missingIds.push(loserId);
      throw new MediaNotFoundError(missingIds);
    }

    // 2. Calculate New Scores
    // eloService expects (winnerElo, loserElo)
    const { winnerNewElo, loserNewElo } = this.eloCalculator.calculateNewScores(
      winner.eloScore,
      loser.eloScore,
    );

    // 3. Update DB through Repository (Transactional)
    await this.duelRepository.updateEloScores(
      winnerId,
      winnerNewElo,
      loserId,
      loserNewElo,
    );

    logger.info(
      {
        winner: {
          title: winner.title,
          oldElo: winner.eloScore,
          newElo: winnerNewElo,
        },
        loser: {
          title: loser.title,
          oldElo: loser.eloScore,
          newElo: loserNewElo,
        },
      },
      '✅ [UpdateEloScoreHandler] Update Complete',
    );
  }
}
