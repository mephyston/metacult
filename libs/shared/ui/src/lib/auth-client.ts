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

const apiUrl = getApiUrl();

export const authClient = createAuthClient({
    baseURL: `${apiUrl}/api/auth`,
});

// Export des composables Vue pour utilisation dans les composants
export const {
    useSession,
    signIn,
    signUp,
    signOut,
} = authClient;
