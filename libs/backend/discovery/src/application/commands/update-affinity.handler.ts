import type { AffinityRepository } from '../../domain/ports/affinity.repository.interface';
import { PersonalAffinityService } from '../../domain/services/personal-affinity.service';
import type {
  DuelUpdateCommand,
  SentimentUpdateCommand,
  UpdateAffinityPayload,
} from './update-affinity.command';
import { Affinity } from '../../domain/entities/affinity.entity';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { sql, eq } from 'drizzle-orm';
import { mediaSchema } from '@metacult/backend-catalog';

export class UpdateAffinityHandler {
  constructor(
    private readonly affinityRepository: AffinityRepository,
    private readonly db: NodePgDatabase, // To update Media table directly (Pragmatic approach)
  ) {}

  async execute(command: UpdateAffinityPayload): Promise<void> {
    if (command.type === 'SENTIMENT') {
      await this.handleSentimentUpdate(command);
    } else if (command.type === 'DUEL') {
      await this.handleDuelUpdate(command);
    }
  }

  private async handleSentimentUpdate(
    command: SentimentUpdateCommand,
  ): Promise<void> {
    const { userId, mediaId, sentiment } = command;

    // Fetch latest Global Elo from DB to ensure accuracy
    const media = await this.db
      .select({ eloScore: mediaSchema.medias.eloScore })
      .from(mediaSchema.medias)
      .where(eq(mediaSchema.medias.id, mediaId))
      .execute();

    const globalElo = media[0]?.eloScore || 1500;

    const initialScore = PersonalAffinityService.initialize(
      globalElo,
      sentiment,
    );
    const existingAffinity = await this.affinityRepository.findByUserAndMedia(
      userId,
      mediaId,
    );

    let affinity: Affinity;
    if (existingAffinity) {
      affinity = existingAffinity.updateScore(initialScore);
    } else {
      affinity = Affinity.create(userId, mediaId, initialScore);
    }

    await this.affinityRepository.save(affinity);
  }

  private async handleDuelUpdate(command: DuelUpdateCommand): Promise<void> {
    const {
      userId,
      winnerMediaId,
      loserMediaId,
      winnerGlobalElo,
      loserGlobalElo,
    } = command;

    // 1. Update Personal Affinities
    let winnerAffinity = await this.affinityRepository.findByUserAndMedia(
      userId,
      winnerMediaId,
    );
    let loserAffinity = await this.affinityRepository.findByUserAndMedia(
      userId,
      loserMediaId,
    );

    if (!winnerAffinity) {
      const initialScore = PersonalAffinityService.initialize(
        winnerGlobalElo,
        'OKAY',
      );
      winnerAffinity = Affinity.create(userId, winnerMediaId, initialScore);
    }

    if (!loserAffinity) {
      const initialScore = PersonalAffinityService.initialize(
        loserGlobalElo,
        'OKAY',
      );
      loserAffinity = Affinity.create(userId, loserMediaId, initialScore);
    }

    const { winnerNewScore, loserNewScore } =
      PersonalAffinityService.updateAfterDuel(
        winnerAffinity.score,
        loserAffinity.score,
      );

    const updatedWinner = winnerAffinity.updateScore(winnerNewScore);
    const updatedLoser = loserAffinity.updateScore(loserNewScore);

    await Promise.all([
      this.affinityRepository.save(updatedWinner),
      this.affinityRepository.save(updatedLoser),
    ]);

    // 2. Update Global Media Elo
    const { winnerNewElo, loserNewElo } =
      PersonalAffinityService.calculateGlobalElo(
        winnerGlobalElo,
        loserGlobalElo,
      );

    // Update Winner
    await this.db
      .update(mediaSchema.medias)
      .set({
        eloScore: winnerNewElo,
        matchCount: sql`${mediaSchema.medias.matchCount} + 1`,
      })
      .where(eq(mediaSchema.medias.id, winnerMediaId));

    // Update Loser
    await this.db
      .update(mediaSchema.medias)
      .set({
        eloScore: loserNewElo,
        matchCount: sql`${mediaSchema.medias.matchCount} + 1`,
      })
      .where(eq(mediaSchema.medias.id, loserMediaId));
  }
}
