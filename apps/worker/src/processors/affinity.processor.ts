import { Job } from 'bullmq';
import { logger } from '@metacult/backend-infrastructure';
import {
  UpdateAffinityHandler,
  DrizzleAffinityRepository,
  type UpdateAffinityPayload,
  userMediaAffinity,
} from '@metacult/backend-discovery';
import { mediaSchema } from '@metacult/backend-catalog';
import { getDbConnection } from '@metacult/backend-infrastructure';

// Manual Dependency Injection / Composition Root
const { db } = getDbConnection({ userMediaAffinity, ...mediaSchema }); // Ensure media schema is loaded
const repository = new DrizzleAffinityRepository(db as any);
const handler = new UpdateAffinityHandler(repository, db as any);

// Export dependencies for testing or transparency
export const affinityProcessorDeps = {
  handler,
};

/**
 * Processes affinity updates from user interactions.
 * Delegates actual logic to UpdateAffinityHandler.
 */
export const processAffinityUpdate = async (
  job: Job<UpdateAffinityPayload>,
) => {
  const { userId, type } = job.data;
  logger.info(`Processing affinity update (${type}) for user ${userId}`);

  try {
    await affinityProcessorDeps.handler.execute(job.data);
  } catch (error) {
    logger.error(
      `Failed to process affinity update`,
      error instanceof Error ? error.stack : String(error),
    );
    throw error;
  }
};
