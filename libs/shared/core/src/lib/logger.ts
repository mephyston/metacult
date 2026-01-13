import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

class ConsoleLogger {
  child(bindings?: any) {
    return this;
  }
  trace(...args: any[]) {
    console.trace(...args);
  }
  debug(...args: any[]) {
    console.debug(...args);
  }
  info(...args: any[]) {
    console.info(...args);
  }
  warn(...args: any[]) {
    console.warn(...args);
  }
  error(...args: any[]) {
    console.error(...args);
  }
  fatal(...args: any[]) {
    console.error(...args);
  }
  silent(...args: any[]) {
    /* noop */
  }
  level = 'info';
}

// In production, use a simple console logger to avoid pino/thread-stream worker issues in bundled environments
export const logger = isProduction
  ? (new ConsoleLogger() as unknown as pino.Logger)
  : pino({
      level: isProduction ? 'info' : 'debug',
      transport:
        !isProduction && !isTest
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss',
                ignore: 'pid,hostname',
                singleLine: false,
              },
            }
          : undefined,
      base: {
        service: 'shared-core',
        env: process.env.NODE_ENV,
      },
    });
