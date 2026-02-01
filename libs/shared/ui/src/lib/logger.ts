/**
 * Simple browser logger for shared UI library
 * Provides consistent logging interface with development/production filtering
 */

const isDev = import.meta.env?.DEV || import.meta.env?.MODE === 'development';

export const logger = {
  info: (...args: unknown[]) => {
    console.info('[UI]', ...args);
  },

  warn: (...args: unknown[]) => {
    console.warn('[UI]', ...args);
  },

  error: (...args: unknown[]) => {
    console.error('[UI]', ...args);
  },

  debug: (...args: unknown[]) => {
    if (isDev) {
      console.log('[UI Debug]', ...args);
    }
  },

  log: (...args: unknown[]) => {
    console.log('[UI]', ...args);
  },
};
