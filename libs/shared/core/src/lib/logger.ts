/**
 * Simple logger for shared core library
 * Provides consistent logging interface
 */

export const logger = {
  info: (...args: any[]) => {
    console.info('[Core]', ...args);
  },
  
  warn: (...args: any[]) => {
    console.warn('[Core]', ...args);
  },
  
  error: (...args: any[]) => {
    console.error('[Core]', ...args);
  },
  
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Core Debug]', ...args);
    }
  },
};
