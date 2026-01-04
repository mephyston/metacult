/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/**
 * Composable Nuxt pour gérer la session utilisateur
 * Utilise useState pour persist la session entre client/serveur
 */
import { authClient } from '../lib/auth-client';
import { useLogger } from './useLogger';

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

export const useAuthSession = () => {
  // État global partagé (SSR-friendly)
  const user = useState<User | null>('auth-user', () => null);
  const isLoading = useState('auth-loading', () => true);

  // Rafraîchir la session depuis l'API
  const refreshSession = async () => {
    const logger = useLogger();
    try {
      isLoading.value = true;
      const { data } = await authClient.getSession();

      if (data?.user) {
        user.value = {
          name: data.user.name ?? undefined,
          email: data.user.email ?? undefined,
          avatar: data.user.image ?? undefined,
        };
      } else {
        user.value = null;
      }
    } catch (error) {
      logger.error('[useAuthSession] Failed to fetch session:', error);
      user.value = null;
    } finally {
      isLoading.value = false;
    }
  };

  // Clear session locale
  const clearSession = () => {
    user.value = null;
  };

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    refreshSession,
    clearSession,
  };
};
