/**
 * Better Auth Client pour Nuxt/Vue 3
 * Configure la connexion au backend API pour l'authentification
 * Utilise le runtime config Nuxt pour résoudre intelligemment les URLs (Split Horizon)
 */
import { createAuthClient } from 'better-auth/vue';
import { DEFAULT_DEV_URLS } from '@metacult/shared-core';

// Helper pour obtenir l'URL de l'API de manière sûre
function getAuthBaseURL(): string {
  // En mode client-only (SPA), on utilise toujours l'URL publique
  if (typeof window !== 'undefined') {
    try {
      const apiUrl = window.__NUXT__?.config?.public?.apiUrl;
      if (apiUrl) {
        return apiUrl;
      }
    } catch (e) {
      console.warn('[auth-client] Failed to read Nuxt config:', e);
    }
  }

  // Fallback pour développement local
  return DEFAULT_DEV_URLS.API;
}

export const authClient = createAuthClient({
  baseURL: `${getAuthBaseURL()}/api/auth`,
});

// Export des composables Vue pour utilisation dans les composants
export const { useSession, signIn, signUp, signOut } = authClient;
