import { importQueue } from '@metacult/backend/infrastructure';

export const initCrons = async () => {
    console.log('⏰ Initializing Cron Jobs...');

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

    console.log('✅ Daily Sync scheduled for 3:00 AM');
};
