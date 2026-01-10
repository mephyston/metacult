import { Job } from 'bullmq';
import { logger } from '@metacult/backend-infrastructure';
import {
  GamificationService,
  GrantXpOnInteractionListener,
} from '@metacult/backend-gamification';
import { InteractionSavedEvent } from '@metacult/backend-interaction';

// Manual Dependency Injection
const gamificationService = new GamificationService();
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
