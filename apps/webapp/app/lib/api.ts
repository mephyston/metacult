import { treaty } from '@elysiajs/eden';
// eslint-disable-next-line @nx/enforce-module-boundaries -- Eden Treaty requires App type from API
import type { App } from '@metacult/api';

/**
 * Eden Treaty Client
 * Provides end-to-end type safety for API calls.
 *
 * IMPORTANT: This must be called within a Nuxt context (composable, component, plugin)
 * to access runtime config. For SSR safety, wrap in a composable.
 */
export const createApiClient = () => {
  const config = useRuntimeConfig();
  // Ensure we have a non-empty string URL for treaty
  const apiUrl: string = config.public.apiUrl || 'http://localhost:3000';

  if (!apiUrl || apiUrl === '') {
    throw new Error(
      '[createApiClient] API URL is not configured. Set NUXT_PUBLIC_API_URL environment variable.',
    );
  }

  return treaty<App>(apiUrl);
};

/**
 * Use this in components/composables
 */
export const useApi = () => createApiClient();
