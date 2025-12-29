import { createWorker, IMPORT_QUEUE_NAME } from '@metacult/backend/infrastructure';
import { processImportMedia } from './processors/import-media.processor';

console.log('🚀 Starting Metacult Worker Service...');

const worker = createWorker(IMPORT_QUEUE_NAME, processImportMedia, {
    concurrency: 5, // Process 5 jobs in parallel
});

// Daemon mode: Keep process alive
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
