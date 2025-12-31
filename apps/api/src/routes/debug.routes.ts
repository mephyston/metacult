import { Elysia } from 'elysia';
import { importQueue } from '@metacult/backend/infrastructure';

export const debugRoutes = new Elysia({ prefix: '/debug' })
    .get('/sync', async () => {
        console.log('⚡️ Manually triggering Daily Global Sync...');
        await importQueue.add('daily-global-sync', { type: 'daily-global-sync' });
        return { success: true, message: 'Sync job triggered' };
    });
