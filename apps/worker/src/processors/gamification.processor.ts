import { Job } from 'bullmq';
import { logger } from '@metacult/backend-infrastructure';
import { GamificationService } from '@metacult/backend-gamification';

// Manual Dependency Injection
const gamificationService = new GamificationService();

interface AwardXpPayload {
  userId: string;
  xp: number;
  source: string;
}

/**
 * Processor for the gamification-queue.
 * Handles XP awards and other gamification events.
 */
export const processGamification = async (job: Job<AwardXpPayload>) => {
  const { userId, xp, source } = job.data;

  logger.info(
    { userId, xp, source, jobId: job.id },
    '[Gamification] Processing XP award job',
  );

  try {
    await gamificationService.addXp(userId, xp, source);
    logger.info(
      { userId, xp, source },
      '[Gamification] XP awarded successfully',
    );
  } catch (error) {
    logger.error(
      { error, userId, xp, source },
      '[Gamification] Failed to award XP',
    );
    throw error;
  }
};
