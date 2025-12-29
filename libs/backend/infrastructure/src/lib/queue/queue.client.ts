import { Queue, Worker, type Processor, type WorkerOptions, type QueueOptions } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse Redis URL slightly more robustly or rely on IORedis auto-parse
const connection = {
    url: REDIS_URL,
};

// --- Producer: Import Queue ---
export const IMPORT_QUEUE_NAME = 'import-queue';

export type ImportJob =
    | { type: 'game' | 'movie' | 'tv' | 'book'; id: string }
    | { type: 'daily-global-sync'; id?: never };

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
export const createWorker = (
    queueName: string,
    processor: Processor,
    options?: Omit<WorkerOptions, 'connection'>
) => {
    console.log(`👷 Initializing worker for queue: ${queueName} with connection: ${REDIS_URL}`);

    const worker = new Worker(queueName, processor, {
        connection,
        ...options,
    });

    worker.on('completed', (job) => {
        console.log(`✅ Job ${job.id} completed!`);
    });

    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job?.id} failed with ${err.message}`);
    });

    return worker;
};
