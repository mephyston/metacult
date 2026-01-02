/**
 * Better Auth Client pour Nuxt/Vue 3
 * Configure la connexion au backend API pour l'authentification
 */
import { createAuthClient } from 'better-auth/vue';

// Configuration de l'URL API depuis les variables d'environnement
// Nuxt expose les variables public via import.meta.env
const baseURL = import.meta.env.NUXT_PUBLIC_API_URL || 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL: `${baseURL}/api/auth`,
});

// Export des composables Vue pour utilisation dans les composants
export const {
  useSession,
  signIn,
  signUp,
  signOut,
} = authClient;
