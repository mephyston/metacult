import { defineNuxtPlugin, navigateTo } from 'nuxt/app';
import { useAuthSession } from '../composables/useAuthSession';
import { useLogger } from '../composables/useLogger';

export default defineNuxtPlugin((nuxtApp) => {
  const { clearSession } = useAuthSession();
  const logger = useLogger();

  // Hook global pour intercepter les erreurs de l'application (SSR et Client)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nuxtApp.hook('app:error', async (error: any) => {
    // Détection d'une erreur 401 Unauthorized
    if (
      error?.statusCode === 401 ||
      error?.response?.status === 401 ||
      error?.message?.includes('401') ||
      error?.message?.toLowerCase().includes('unauthorized')
    ) {
      logger.warn(
        '[AuthPlugin] 401 Unauthorized detected. Clearing session and redirecting to login.',
      );

      // Nettoyage de la session locale
      clearSession();

      // Redirection forcée vers le login
      // On utilise window.location pour un refresh complet si côté client, pour nettoyer l'état propre
      if (process.client) {
        window.location.href = '/login?reason=session_expired';
      } else {
        await navigateTo('/login?reason=session_expired');
      }
    }
  });
});
