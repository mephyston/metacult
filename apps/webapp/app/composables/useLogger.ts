/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore - Nuxt composable
/**
 * Browser logger composable for frontend logging
 * Provides consistent logging interface across the application
 * 
 * - Production: Only errors and warnings are logged
 * - Development: All levels including debug are logged
 */
export const useLogger = () => {
  const isDev = import.meta.dev;

  return {
    info: (...args: unknown[]) => {
      if (isDev || import.meta.server) {
        console.info('[INFO]', ...args);
      }
    },
    warn: (...args: unknown[]) => {
      console.warn('[WARN]', ...args);
    },
    error: (...args: unknown[]) => {
      console.error('[ERROR]', ...args);
    },
    debug: (...args: unknown[]) => {
      if (isDev) {
        console.debug('[DEBUG]', ...args);
      }
    },
    log: (...args: unknown[]) => {
      if (isDev || import.meta.server) {
        console.log('[LOG]', ...args);
      }
    },
  };
};
