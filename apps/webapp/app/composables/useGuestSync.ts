import { useApiUrl } from './useApiUrl';
import { useLogger } from './useLogger';

/**
 * Composable pour gérer la synchronisation des interactions (swipes) faites en mode invité.
 *
 * Flow :
 * 1. Le site marketing redirige vers l'app avec ?sync=BASE64
 * 2. initSync() décode et stocke ça temporairement (SessionStorage/State)
 * 3. Une fois loggé, flushSync() envoie tout au backend
 */
interface GuestSwipe {
  mediaId: string;
  action: string;
  sentiment?: string;
}

export const useGuestSync = () => {
  const route = useRoute();
  const router = useRouter();

  // État persistant (client-side) des swipes en attente
  const pendingSwipes = useState<GuestSwipe[]>('pending_swipes', () => []);

  /**
   * À appeler au montage de l'app (app.vue ou plugin)
   * Vérifie la présence du query param 'sync', le décode et le stocke.
   */
  const initSync = async () => {
    if (import.meta.server) return;
    const logger = useLogger();

    const syncParam = route.query.sync as string;
    if (syncParam) {
      try {
        // Décodage Base64 Url-safe (au cas où)
        // Note: btoa/atob standard gère le base64 classique.
        const json = atob(syncParam);
        const swipes = JSON.parse(json);

        if (Array.isArray(swipes) && swipes.length > 0) {
          logger.info(
            `[GuestSync] Found ${swipes.length} pending swipes. Storing...`,
          );
          // Simple validation/casting
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          pendingSwipes.value = swipes.map((s: any) => ({
            mediaId: s.mediaId,
            action: s.action,
            sentiment: s.sentiment,
          }));

          // Nettoyage de l'URL pour ne pas polluer
          const query = { ...route.query };
          delete query.sync;
          await router.replace({ query });
        }
      } catch (e) {
        logger.error('[GuestSync] Failed to parse sync param', e);
      }
    }
  };

  /**
   * À appeler après un succès de Login ou Register.
   * Envoie les données au backend.
   */
  const flushSync = async () => {
    if (pendingSwipes.value.length === 0) return;
    const logger = useLogger();

    logger.info('[GuestSync] Flushing pending swipes to backend...');

    try {
      // On utilise $fetch qui utilisera automatiquement les cookies de session (si same-origin/proxy)
      // L'URL relative /api/interactions/sync passera par le proxy Nuxt ou directement si configuré.
      // On utilise useRuntimeConfig si besoin de l'URL absolue, mais le proxy dev est mieux.
      // Supposons que /api est proxifié vers le backend ou que le backend est sur le même port/domaine via proxy.

      // Si le backend est sur 3000 et Nuxt sur 4200, il faut un proxy ou CORS.
      // Better Auth gère CORS.

      const apiUrl = useApiUrl();
      // Sanitize payload:
      // 1. Remove timestamp/extra fields
      // 2. Allow any non-empty string as mediaId (Backend handles validation/foreign keys)
      // const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

      logger.debug(
        '[GuestSync] Pending Swipes Raw:',
        JSON.stringify(pendingSwipes.value),
      );

      const payload = pendingSwipes.value
        .filter((s) => s.mediaId) // Keep any item with an ID
        .map((s) => ({
          mediaId: s.mediaId,
          action: s.action,
          sentiment: s.sentiment, // Optional
        }));

      if (payload.length === 0) {
        logger.warn(
          '[GuestSync] No valid interactions to sync (all filtered out). Clearing storage.',
        );
        pendingSwipes.value = [];
        return;
      }

      await $fetch('/interactions/sync', {
        baseURL: `${apiUrl}/api`,
        method: 'POST',
        body: payload,
        // Important pour envoyer les cookies de session if cross-domain mais BetterAuth gère ça.
        // Si on est sur le même domaine, ça marche tout seul.
        credentials: 'include',
      });

      logger.info('[GuestSync] Sync successful!');
      pendingSwipes.value = []; // Reset
    } catch (e) {
      logger.error('[GuestSync] Sync failed', e);
      // On garde pendingSwipes.value pour réessayer plus tard ?
      // Pour l'instant on log juste, l'user a peut-être perdu ses swipes s'il quitte.
    }
  };

  return {
    initSync,
    flushSync,
    hasPending: computed(() => pendingSwipes.value.length > 0),
  };
};
