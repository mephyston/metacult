/**
 * Better Auth Client pour Nuxt/Vue 3
 * Configure la connexion au backend API pour l'authentification
 * Utilise le runtime config Nuxt pour résoudre intelligemment les URLs (Split Horizon)
 */
import { createAuthClient } from 'better-auth/vue';
import { DEFAULT_DEV_URLS } from '@metacult/shared-core';

// Determine auth URL from runtime config
// In server context, we can use internal URL; in browser, we use public URL
const getAuthUrl = () => {
  if (import.meta.server) {
    const config = useRuntimeConfig();
    // Server-side: prefer internal URL for service-to-service calls
    return config.internalApiUrl || config.public.apiUrl || DEFAULT_DEV_URLS.API;
  }
  // Client-side: use public API URL
  const config = useRuntimeConfig();
  return config.public.apiUrl || DEFAULT_DEV_URLS.API;
};

const baseURL = getAuthUrl();

export const authClient = createAuthClient({
  baseURL: `${baseURL}/api/auth`,
});

// Export des composables Vue pour utilisation dans les composants
export const { useSession, signIn, signUp, signOut } = authClient;
