import { asUserId, type IEventHandler } from '@metacult/shared-core';
import type { InteractionSavedEvent } from '@metacult/backend-interaction';
import { GamificationService } from '../services/gamification.service';
import { logger } from '@metacult/backend-infrastructure';

/**
 * Event Listener: Grants XP when a user interaction is saved.
 * Implements IEventHandler<InteractionSavedEvent>.
 *
 * This listener is triggered by the gamification-queue processor.
 */
export class GrantXpOnInteractionListener
  implements IEventHandler<InteractionSavedEvent>
{
  // XP rewards per action type
  private static readonly XP_REWARDS: Record<string, number> = {
    LIKE: 10,
    DISLIKE: 5,
    WISHLIST: 15,
    SKIP: 2,
  };

  constructor(private readonly gamificationService: GamificationService) {}

  async handle(event: InteractionSavedEvent): Promise<void> {
    const { userId, action } = event.payload;

    const xpAmount = GrantXpOnInteractionListener.XP_REWARDS[action] ?? 10;

    logger.info(
      { userId, action, xp: xpAmount },
      '[GrantXpOnInteractionListener] Awarding XP',
    );

    try {
      await this.gamificationService.addXp(asUserId(userId), xpAmount);
    } catch (error) {
      logger.error(
        { error, userId, action },
        '[GrantXpOnInteractionListener] Failed to award XP',
      );
      throw error;
    }
  }
}
