import { logger } from '@metacult/backend-infrastructure';
import type { IInteractionRepository } from '../../domain/ports/interaction.repository.interface';
import type { SyncInteractionPayload } from '../../domain/ports/interaction.repository.interface';
import type { UserId } from '@metacult/shared-core';

export class SyncInteractionsHandler {
  constructor(private readonly interactionRepository: IInteractionRepository) {}

  async execute(
    userId: UserId,
    interactions: SyncInteractionPayload[],
  ): Promise<void> {
    logger.info(
      { userId, count: interactions.length },
      '[Sync] Starting sync for user',
    );

    await this.interactionRepository.syncInteractions(userId, interactions);

    logger.info({ userId }, '[Sync] Completed sync');
  }
}
