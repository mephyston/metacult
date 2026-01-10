import { Queue, Worker, type Processor, type WorkerOptions } from 'bullmq';
import { logger } from '../logger/logger.service';

import { configService } from '../config/configuration.service';

const REDIS_URL = configService.get('REDIS_URL');

// Parse Redis URL slightly more robustly or rely on IORedis auto-parse
const connection = {
  url: REDIS_URL,
};

// --- Producer: Import Queue ---
export const IMPORT_QUEUE_NAME = 'import-queue';

/**
 * Définition des Jobs acceptés par la Queue d'Import.
 * @typedef ImportJob
 */
export type ImportJob =
  | { type: 'game' | 'movie' | 'tv' | 'book'; id: string; requestId?: string }
  | { type: 'daily-global-sync'; id?: never; requestId?: string };

export const importQueue = new Queue<ImportJob>(IMPORT_QUEUE_NAME, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// --- Consumer: Worker Factory ---
/**
 * Factory pour créer un Worker BullMQ configuré standard.
 *
 * @param {string} queueName - Nom de la file à écouter.
 * @param {Processor} processor - Fonction de traitement du job.
 * @param {WorkerOptions} options - Options BullMQ (concurrency, etc.).
 * @returns {Worker} L'instance du Worker.
 */
export const createWorker = (
  queueName: string,
  processor: Processor,
  options?: Omit<WorkerOptions, 'connection'>,
) => {
  logger.info(
    { queueName, redisUrl: REDIS_URL },
    '👷 Initialisation worker pour la queue',
  );

  const worker = new Worker(queueName, processor, {
    connection,
    ...options,
  });

  worker.on('completed', (job) => {
    logger.info({ jobId: job.id }, '✅ Job terminé');
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, '❌ Job échoué');
  });

  return worker;
};
