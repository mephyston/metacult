import { processOutbox } from '@metacult/shared-sync-manager';

export default defineNuxtPlugin((nuxtApp) => {
  // Only run on client
  if (import.meta.server) return;

  const config = useRuntimeConfig();
  const logger = useLogger();
  // Auth is handled via httpOnly cookies sent automatically by 'credentials: 'include'
  // in the fetch request within processOutbox.

  const apiBase = config.public.apiUrl || 'http://localhost:3000'; // Fallback

  const runSync = async () => {
    if (!navigator.onLine) return; // Don't try if offline

    try {
      await processOutbox(apiBase as string, async () => {
        // Return null token, relying on cookies
        return null;
      });
    } catch (e) {
      logger.error('[SyncPlugin] Error processing outbox', e);
    }
  };

  // 1. Periodic Sync (every 10s)
  const interval = setInterval(runSync, 10000);

  // 2. On Online Event
  window.addEventListener('online', () => {
    logger.info('[SyncPlugin] Back online, triggering sync...');
    runSync();
  });

  // Cleanup
  nuxtApp.hook('app:beforeMount', () => {
    // ...
  });
});
