import { createWorker, IMPORT_QUEUE_NAME } from '../../../libs/backend/infrastructure/src/lib/queue/queue.client';
// import { createWorker, IMPORT_QUEUE_NAME } from '../../../libs/backend/infrastructure/src/index';
import { processImportMedia } from './processors/import-media.processor';

console.log('🚀 Starting Metacult Worker Service...');

// Create Worker
// The actual switch logic for job types is delegated to the processor function
const worker = createWorker(IMPORT_QUEUE_NAME, processImportMedia, {
    concurrency: 5, // Process up to 5 jobs in parallel
    limiter: {
        max: 1, // Max 1 job...
        duration: 1100, // ...per 1.1 seconds (Respect Google/External API Quotas)
    },
});

// Daemon mode checks
process.on('SIGSIGINT', async () => {
    console.log('🛑 Shutting down worker...');
    await worker.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down worker...');
    await worker.close();
    process.exit(0);
});

console.log(`👷 Worker listening on queue: ${IMPORT_QUEUE_NAME}`);
