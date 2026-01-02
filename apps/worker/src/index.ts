import { processImportMedia } from './processors/import-media.processor';
import {
  createWorker,
  IMPORT_QUEUE_NAME,
  patchConsole,
} from '@metacult/backend/infrastructure';
import { processRankingUpdate } from './processors/ranking.processor';
import { RANKING_QUEUE_NAME } from '@metacult/backend/ranking';

export const startWorker = async () => {
  // Apply logging patch
  patchConsole();

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

  // --- Ranking Worker ---
  // Pas de rate limit strict nécessaire pour les updates SQL, mais on garde une bonne concurrence
  const rankingWorker = createWorker(RANKING_QUEUE_NAME, processRankingUpdate, {
    concurrency: 10, // Traitement rapide en parallèle
  });

  // Daemon mode checks
  process.on('SIGINT', async () => {
    console.log('🛑 Shutting down workers...');
    await Promise.all([worker.close(), rankingWorker.close()]);
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down workers...');
    await Promise.all([worker.close(), rankingWorker.close()]);
    process.exit(0);
  });

  console.log(
    `👷 Worker listening on queues: ${IMPORT_QUEUE_NAME}, ${RANKING_QUEUE_NAME}`,
  );
};

startWorker();
