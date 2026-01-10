import { processImportMedia } from './processors/import-media.processor';
import {
  createWorker,
  IMPORT_QUEUE_NAME,
  logger,
} from '@metacult/backend-infrastructure';
import { processRankingUpdate } from './processors/ranking.processor';
import { RANKING_QUEUE_NAME } from '@metacult/backend-ranking';
import { processAffinityUpdate } from './processors/affinity.processor';
import { processComputeNeighbors } from './processors/compute-neighbors.processor';
import { processGamification } from './processors/gamification.processor';
import {
  AFFINITY_QUEUE_NAME,
  COMPUTE_NEIGHBORS_QUEUE_NAME,
} from '@metacult/backend-discovery';
import { Queue } from 'bullmq';

// Queue name for gamification (matches save-interaction.command.ts)
const GAMIFICATION_QUEUE_NAME = 'gamification-queue';

export const startWorker = async () => {
  logger.info('🚀 Starting Metacult Worker Service...');

  // --- Redis Connection Config ---
  // We reuse the connection logic implicitly managed by createWorker/getDbConnection
  // or we need the connection string.
  // IMPORTANT: For Queue to add jobs, we need the connection info.
  // Assuming process.env.REDIS_URL or similar is available or we use default IOREDIS.
  const redisConnection = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };

  /**
   * Point d'entrée du Worker.
   * Initialise le processeur de file d'attente avec une stratégie de Rate Limiting stricte
   * pour respecter les quotas des APIs externes (IGDB, TMDB, Google Books).
   */
  const worker = createWorker(IMPORT_QUEUE_NAME, processImportMedia, {
    concurrency: 5, // Traite jusqu'à 5 jobs en parallèle (si le rate limit le permet)
    limiter: {
      max: 1, // Max 1 job...
      duration: 1100, // ...toutes les 1.1 secondes (soit ~0.9 req/sec)
    },
  });

  // --- Ranking Worker ---
  // Pas de rate limit strict nécessaire pour les updates SQL, mais on garde une bonne concurrence
  const rankingWorker = createWorker(RANKING_QUEUE_NAME, processRankingUpdate, {
    concurrency: 10, // Traitement rapide en parallèle
  });

  // --- Affinity Worker ---
  const affinityWorker = createWorker(
    AFFINITY_QUEUE_NAME,
    processAffinityUpdate,
    {
      concurrency: 10,
    },
  );

  // --- Compute Neighbors Worker (Batch Job) ---
  const computeNeighborsWorker = createWorker(
    COMPUTE_NEIGHBORS_QUEUE_NAME,
    processComputeNeighbors,
    {
      concurrency: 1, // Sequential execution is safer for heavy batch jobs
    },
  );

  // --- Gamification Worker ---
  const gamificationWorker = createWorker(
    GAMIFICATION_QUEUE_NAME,
    processGamification,
    {
      concurrency: 10,
    },
  );

  // Schedule the Cron Job (Upsert)
  const computeNeighborsQueue = new Queue(COMPUTE_NEIGHBORS_QUEUE_NAME, {
    connection: redisConnection,
  });

  await computeNeighborsQueue.add(
    'compute-neighbors-daily',
    {},
    {
      repeat: {
        pattern: '0 0 * * *', // Every day at midnight
      },
      jobId: 'compute-neighbors-daily-job', // Ensure singleton
    },
  );
  logger.info('📅 Scheduled Compute Neighbors batch job (Daily at 00:00)');

  // Daemon mode checks
  process.on('SIGINT', async () => {
    logger.info('🛑 Shutting down workers...');
    await Promise.all([
      worker.close(),
      rankingWorker.close(),
      affinityWorker.close(),
      computeNeighborsWorker.close(),
      gamificationWorker.close(),
      computeNeighborsQueue.close(),
    ]);
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('🛑 Shutting down workers...');
    await Promise.all([
      worker.close(),
      rankingWorker.close(),
      affinityWorker.close(),
      computeNeighborsWorker.close(),
      gamificationWorker.close(),
      computeNeighborsQueue.close(),
    ]);
    process.exit(0);
  });

  logger.info(
    `👷 Worker listening on queues: ${IMPORT_QUEUE_NAME}, ${RANKING_QUEUE_NAME}, ${AFFINITY_QUEUE_NAME}, ${COMPUTE_NEIGHBORS_QUEUE_NAME}, ${GAMIFICATION_QUEUE_NAME}`,
  );
};

startWorker();
