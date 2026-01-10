import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { configService, logger } from '@metacult/backend-infrastructure';
import type { IInteractionRepository } from '../ports/interaction.repository.interface';
import {
  UserInteraction,
  InteractionAction,
  InteractionSentiment,
} from '../../domain/entities/user-interaction.entity';
import { InteractionSavedEvent } from '../../domain/events/interaction-saved.event';

// Queue Names
const AFFINITY_QUEUE_NAME = 'affinity-queue';
const GAMIFICATION_QUEUE_NAME = 'gamification-queue';

// Redis Connection
const connection = {
  url: configService.get('REDIS_URL'),
};

// Queues (lazy initialized)
let affinityQueue: Queue | null = null;
let gamificationQueue: Queue | null = null;

const getAffinityQueue = () => {
  if (!affinityQueue) {
    affinityQueue = new Queue(AFFINITY_QUEUE_NAME, { connection });
  }
  return affinityQueue;
};

const getGamificationQueue = () => {
  if (!gamificationQueue) {
    gamificationQueue = new Queue(GAMIFICATION_QUEUE_NAME, { connection });
  }
  return gamificationQueue;
};

/**
 * Command DTO for saving an interaction.
 */
export interface SaveInteractionCommand {
  userId: string;
  mediaId: string;
  action: string;
  sentiment?: string;
}

/**
 * Handler for SaveInteractionCommand.
 * Adheres to Clean Architecture: no direct DB access, uses repository.
 */
export class SaveInteractionHandler {
  constructor(private readonly interactionRepository: IInteractionRepository) {}

  async execute(command: SaveInteractionCommand): Promise<UserInteraction> {
    const { userId, mediaId, action, sentiment } = command;

    // 1. Create or update entity
    const now = new Date();
    const existing = await this.interactionRepository.findByUserAndMedia(
      userId,
      mediaId,
    );

    const interaction = new UserInteraction({
      id: existing?.id ?? uuidv4(),
      userId,
      mediaId,
      action: action as InteractionAction,
      sentiment: (sentiment as InteractionSentiment) ?? null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });

    // 2. Persist via repository
    await this.interactionRepository.save(interaction);

    // 3. Publish domain event to queues (async, fire-and-forget)
    const event = new InteractionSavedEvent({
      userId,
      mediaId,
      action,
      sentiment: sentiment ?? null,
      timestamp: now,
    });

    this.publishEvents(event).catch((err) => {
      logger.error({ err }, 'Failed to publish interaction events');
    });

    return interaction;
  }

  private async publishEvents(event: InteractionSavedEvent): Promise<void> {
    const { userId, mediaId, sentiment } = event.payload;

    // Affinity update (Discovery module)
    await getAffinityQueue().add('update-sentiment', {
      type: 'SENTIMENT',
      userId,
      mediaId,
      sentiment: sentiment || 'OKAY',
      globalElo: 1500, // Placeholder, worker should fetch latest
    });

    // Gamification XP award
    await getGamificationQueue().add('award-xp', {
      userId,
      xp: 10,
      source: 'SWIPE',
    });
  }
}
