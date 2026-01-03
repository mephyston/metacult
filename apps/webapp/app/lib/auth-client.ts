/**
 * Better Auth Client pour Nuxt/Vue 3
 * Configure la connexion au backend API pour l'authentification
 */
import { createAuthClient } from 'better-auth/vue';
import { getApiUrl } from '@metacult/shared-ui';

// Use shared robust logic (Split Horizon + Domain Inference)
const baseURL = getApiUrl();

export const authClient = createAuthClient({
  baseURL: `${baseURL}/api/auth`,
});

// Export des composables Vue pour utilisation dans les composants
export const { useSession, signIn, signUp, signOut } = authClient;
