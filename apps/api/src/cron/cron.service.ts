import { importQueue, logger } from '@metacult/backend-infrastructure';

/**
 * Initialise les tâches planifiées (Cron Jobs) dans BullMQ.
 * Idempotent: Les configurations 'repeat' écrasent les précédentes si le jobId est identique.
 */
export const initCrons = async () => {
  logger.info('[Cron] Initializing scheduled tasks');

  // Daily Sync at 3:00 AM
  await importQueue.add(
    'daily-global-sync',
    { type: 'daily-global-sync' },
    {
      repeat: { pattern: '0 3 * * *' },
      jobId: 'daily-global-sync-job',
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  logger.info('[Cron] Daily sync scheduled for 03:00');
};
