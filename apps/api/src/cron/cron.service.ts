import { importQueue } from '@metacult/backend/infrastructure';

/**
 * Initialise les tâches planifiées (Cron Jobs) dans BullMQ.
 * Idempotent: Les configurations 'repeat' écrasent les précédentes si le jobId est identique.
 */
export const initCrons = async () => {
    console.log('⏰ Initialisation des tâches Cron...');

    // Daily Sync at 3:00 AM
    await importQueue.add(
        'daily-global-sync',
        { type: 'daily-global-sync' },
        {
            repeat: { pattern: '0 3 * * *' },
            jobId: 'daily-global-sync-job',
            removeOnComplete: true,
            removeOnFail: false
        }
    );

    console.log('✅ Synchro quotidienne planifiée pour 03h00');
};
