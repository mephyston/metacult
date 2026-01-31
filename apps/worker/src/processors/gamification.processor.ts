import { logger } from '@metacult/backend-infrastructure';
import {
  GamificationService,
  GrantXpOnInteractionListener,
  DrizzleGamificationRepository,
} from '@metacult/backend-gamification';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { InteractionSavedEvent } from '@metacult/backend-interaction';
import { Job } from 'bullmq';

// Manual Dependency Injection
const { db } = getDbConnection();
// We assume schema is part of what's passed or cast to any if schema is not exported
const repo = new DrizzleGamificationRepository(db as any);
const gamificationService = new GamificationService(repo);
const grantXpListener = new GrantXpOnInteractionListener(gamificationService);

interface InteractionEventPayload {
  userId: string;
  mediaId: string;
  action: string;
  sentiment: string | null;
  timestamp?: string;
}

/**
 * Processor for the gamification-queue.
 * Delegates to GrantXpOnInteractionListener for event handling.
 */
export const processGamification = async (
  job: Job<InteractionEventPayload>,
) => {
  const { userId, mediaId, action, sentiment, timestamp } = job.data;

  logger.info(
    { userId, action, jobId: job.id },
    '[Gamification] Processing interaction event',
  );

  // Reconstruct domain event from job payload
  const event = new InteractionSavedEvent({
    userId,
    mediaId,
    action,
    sentiment,
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  });

  // Delegate to listener
  await grantXpListener.handle(event);
};
