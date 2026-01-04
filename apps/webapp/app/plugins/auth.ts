/**
 * Plugin Nuxt pour Better Auth
 * Charge la session utilisateur au démarrage via le composable useAuthSession
 */
import { defineNuxtPlugin } from 'nuxt/app';
import { useAuthSession } from '../composables/useAuthSession';

export default defineNuxtPlugin(async () => {
    const { refreshSession } = useAuthSession();
    
    // Charger la session au démarrage de l'app
    await refreshSession();
});
