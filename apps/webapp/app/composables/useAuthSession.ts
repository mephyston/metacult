/**
 * Composable Nuxt pour gérer la session utilisateur (Offline-First)
 * Utilise useState pour persist la session entre client/serveur
 * Utilise Dexie pour la persistance locale (Optimistic Auth)
 */
import { useState, useRequestHeaders } from '#app';
import { readonly } from 'vue';
import { authClient } from '../lib/auth-client';
import { useLogger } from './useLogger';
import { useApiUrl } from './useApiUrl';
import { db } from '@metacult/shared-local-db';
import { processOutbox } from '@metacult/shared-sync-manager';
import type { UserProfile } from '@metacult/shared-types';
import { useApi } from '../lib/api';

export const useAuthSession = () => {
  // État global partagé (SSR-friendly)
  const user = useState<UserProfile | null>('auth-user', () => null);
  const isLoading = useState('auth-loading', () => true);

  /**
   * Explicit Logout
   */
  const clearSession = async () => {
    user.value = null;
    await authClient.signOut();
    if (import.meta.client) {
      const lastId = localStorage.getItem('metacult_current_user_id');
      if (lastId) {
        await db.userProfile.delete(lastId); // Remove from offline cache
        localStorage.removeItem('metacult_current_user_id');
      }
    }
  };

  /**
   * Boot Sequence:
   * 1. Charger depuis Dexie (Instant) pour UI "loggé"
   * 2. Tenter refresh via API (Async) pour valider session
   */
  const refreshSession = async () => {
    const logger = useLogger();
    isLoading.value = true;

    // 1. Optimistic Load (Client Only)
    if (import.meta.client) {
      try {
        const localUser = await db.userProfile.get('me');
        if (localUser) {
          user.value = localUser as UserProfile;
          logger.info('[useAuthSession] Loaded optimistic session from Dexie');
          isLoading.value = false; // UI is ready
        }
      } catch (e: any) {
        logger.warn('[useAuthSession] Failed to load from Dexie', e);
      }
    }

    // 2. Authoritative Sync (Network)
    try {
      const { data } = await authClient.getSession();

      if (data?.user) {
        // Map BetterAuth User to our strict UserProfile
        const mappedUser: UserProfile = {
          id: data.user.id,
          username: data.user.name || 'Anonymous', // Fallback
          email: data.user.email,
          avatarUrl: data.user.image || undefined,
          createdAt: data.user.createdAt.toString(), // Ensure string
          level: 1, // Default
          xp: 0,
          nextLevelXp: 100,
        };

        // Fetch Gamification Stats
        try {
          // Headers for SSR cookie forwarding
          const headers = import.meta.server
            ? useRequestHeaders(['cookie'])
            : undefined;

          // Eden Treaty Call (Type-Safe) - Get API client from composable
          const apiClient = useApi();
          const { data: statsObject, error } =
            await apiClient.api.gamification.me.get({
              headers: headers as any,
              fetch: {
                credentials: 'include',
              },
            });

          if (error) {
            throw error;
          }

          const stats = statsObject;

          if (stats) {
            mappedUser.level = stats.level;
            mappedUser.xp = stats.xp;
            mappedUser.nextLevelXp = stats.nextLevelXp;
          }
        } catch (err: any) {
          logger.warn(
            '[useAuthSession] Failed to fetch gamification stats',
            err,
          );
        }

        user.value = mappedUser;

        // Persist "me" to Dexie for next offline boot
        if (import.meta.client) {
          // We store key "me" or use ID? Using "me" simplifies retrieval
          // But Schema says id is string. Let's use specific ID but also a "current_user" config?
          // SIMPLIFICATION: We overwrite the record with id='me' for fast lookup, OR we query first.
          // Better: Store real user record, store "session" key separately.
          // For MVP F00: Storing as 'me' record in a separate config might be cleaner,
          // but let's stick to storing the User record properly and remembering ID in localStorage if needed.
          // TRICK: Dexie 'userProfile' table. We put the user there.
          // IsAuthenticated flag?
          // Let's simpler: Store as id='me' for the "Local Current User".
          // This violates Schema if ID must be UUID.
          // Correct way: Store user with real ID. Store 'last_user_id' in localStorage.
          // FAST PATH: We just overwrite `me` entry in a dedicated KeyValue store?
          // Re-reading db.ts: userProfile: 'id, email'.
          // Let's stick to: Put Real User in DB. Put 'currentUserId' in localStorage.

          // Store user in local DB
          await db.userProfile.put(mappedUser);
          localStorage.setItem(
            'metacult_current_user_id',
            String(mappedUser.id),
          );

          // Trigger Immediate Sync (Guest -> User transition)
          // We don't await this to not block UI
          // Explicit cast to avoid TS inference issues with Nuxt auto-imports
          processOutbox(useApiUrl() as string, async () => null)
            .then(() =>
              logger.info('[useAuthSession] Post-login sync triggered'),
            )
            .catch((e) =>
              logger.warn('[useAuthSession] Post-login sync failed', e),
            );
        }
      } else {
        // Not logged in API side -> Verify if we need to clear local?
        // If API says 401, we must logout.
        if (user.value) {
          logger.warn(
            '[useAuthSession] API says Unauthorized. Clearing local session.',
          );
          await clearSession();
        }
        user.value = null;
      }
    } catch (error) {
      // Network Error? Keep optimistic user if exists!
      logger.error(
        '[useAuthSession] Network failed. Keeping optimistic session if valid.',
        error,
      );
      // DO NOT nullify user.value here. Offline Mode active.
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Helper to load 'me' from local DB based on localStorage
   */
  const loadLocalMe = async () => {
    if (!import.meta.client) return null;
    const id = localStorage.getItem('metacult_current_user_id');
    if (!id) return null;
    return await db.userProfile.get(id);
  };

  // Override refresh logic with the localStorage glue
  const enhancedRefresh = async () => {
    if (import.meta.client) {
      const local = await loadLocalMe();
      if (local) {
        user.value = local;
        isLoading.value = false;
      }
    }
    // Then trigger network sync
    return refreshSession();
  };

  return {
    user: readonly(user),
    isLoading: readonly(isLoading),
    refreshSession: enhancedRefresh, // Use the enhanced version
    clearSession,
  };
};
