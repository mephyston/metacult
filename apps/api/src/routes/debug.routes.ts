import { Elysia } from 'elysia';
import { importQueue, logger } from '@metacult/backend/infrastructure';

export const debugRoutes = new Elysia({ prefix: '/debug' })
    .get('/sync', async () => {
        logger.info('⚡️ Manually triggering Daily Global Sync...');
        await importQueue.add('daily-global-sync', { type: 'daily-global-sync' });
        return { success: true, message: 'Sync job triggered' };
    });
