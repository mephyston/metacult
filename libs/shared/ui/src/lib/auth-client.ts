/**
 * Better Auth Client partagé (framework-agnostic)
 * Utilisable dans Astro, Nuxt, ou tout environnement Vue 3
 *
 * Configure la connexion au backend API pour l'authentification
 */
import { createAuthClient } from 'better-auth/vue';

// Récupération de l'URL API depuis PUBLIC_API_URL (convention unifiée)
// Utilisé par Astro et Nuxt
import { getApiUrl } from './utils';
import { logger } from './logger';

const apiUrl = getApiUrl();
// Debug URL resolution on client
if (typeof window !== 'undefined') {
  logger.debug('[AuthClient] Window Hostname:', window.location.hostname);
  logger.debug('[AuthClient] Resolved API URL:', apiUrl);
  logger.debug('[AuthClient] Public Env:', window.__ENV__?.PUBLIC_API_URL);
}

const cookiePrefix = import.meta.env.PUBLIC_AUTH_COOKIE_PREFIX || 'metacult';

export const authClient = createAuthClient({
  baseURL: `${apiUrl}/api/auth`,
  advanced: {
    cookiePrefix,
  },
});

// Export des composables Vue pour utilisation dans les composants
export const { useSession, signIn, signUp, signOut } = authClient;
