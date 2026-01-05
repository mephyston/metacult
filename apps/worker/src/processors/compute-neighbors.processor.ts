import { Job } from 'bullmq';
import { logger, getDbConnection } from '@metacult/backend-infrastructure';
import {
  ComputeNeighborsService,
  DrizzleAffinityRepository,
  DrizzleSimilarityRepository,
} from '@metacult/backend-discovery';

// Manual Dependency Injection Setup
// We initialize this once when the module/worker loads
const { db } = getDbConnection();
const affinityRepo = new DrizzleAffinityRepository(db as any); // Cast as any because infrastructure schema might differ slightly but compatible at runtime
const similarityRepo = new DrizzleSimilarityRepository(db as any);
const computeNeighborsService = new ComputeNeighborsService(
  db as any,
  affinityRepo,
  similarityRepo,
);

export const processComputeNeighbors = async (job: Job) => {
  logger.info(`[ComputeNeighbors] Starting scheduled job ${job.id}`);

  try {
    const start = Date.now();
    await computeNeighborsService.execute();
    const duration = Date.now() - start;
    logger.info(`[ComputeNeighbors] Job completed in ${duration}ms`);
  } catch (error) {
    logger.error(
      `[ComputeNeighbors] Job failed`,
      error instanceof Error ? error.stack : String(error),
    );
    throw error;
  }
};
