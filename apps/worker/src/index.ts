import { createWorker, IMPORT_QUEUE_NAME } from '@metacult/backend/infrastructure';
import { processImportMedia } from './processors/import-media.processor';

console.log('🚀 Starting Metacult Worker Service...');

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
