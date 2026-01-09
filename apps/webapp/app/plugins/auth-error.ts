import { defineNuxtPlugin, navigateTo } from 'nuxt/app';
import { useAuthSession } from '../composables/useAuthSession';
import { useLogger } from '../composables/useLogger';

export default defineNuxtPlugin((nuxtApp) => {
  const { clearSession } = useAuthSession();
  const logger = useLogger();

  // Hook global pour intercepter les erreurs de l'application (SSR et Client)
  nuxtApp.hook('app:error', async (error: unknown) => {
    // Détection d'une erreur 401 Unauthorized
    const err = error as any; // Safe assumption for legacy error objects if we don't have a strict Error type
    if (
      err?.statusCode === 401 ||
      err?.response?.status === 401 ||
      err?.message?.includes('401') ||
      (typeof err?.message === 'string' &&
        err.message.toLowerCase().includes('unauthorized'))
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
