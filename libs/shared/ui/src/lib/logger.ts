/**
 * Simple browser logger for shared UI library
 * Provides consistent logging interface with development/production filtering
 */

const isDev = import.meta.env?.DEV || import.meta.env?.MODE === 'development';

export const logger = {
  info: (...args: any[]) => {
    console.info('[UI]', ...args);
  },
  
  warn: (...args: any[]) => {
    console.warn('[UI]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[UI]', ...args);
  },
  
  debug: (...args: any[]) => {
    if (isDev) {
      console.log('[UI Debug]', ...args);
    }
  },
  
  log: (...args: any[]) => {
    console.log('[UI]', ...args);
  },
};
