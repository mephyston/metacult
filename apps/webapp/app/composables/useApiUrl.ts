/**
 * Nuxt composable for resolving API URL based on context (SSR vs Client)
 * Uses Split Horizon architecture: internal URL for SSR, public URL for client
 *
 * - SSR (Server): Uses `internalApiUrl` (Docker/Railway private network)
 * - Client (Browser): Uses `public.apiUrl` (Public Internet)
 */
export const useApiUrl = () => {
  const config = useRuntimeConfig();

  if (import.meta.server) {
    // SSR: Priority to internal URL if defined
    if (config.internalApiUrl && config.internalApiUrl !== '') {
      return config.internalApiUrl;
    }
  }

  // Client or SSR Fallback: Public URL
  return config.public.apiUrl || 'http://localhost:3000';
};

/**
 * Nuxt composable for resolving Website URL
 */

export const useWebsiteUrl = () => {
  const config = useRuntimeConfig();
  return config.public.websiteUrl || 'http://localhost:4444';
};
