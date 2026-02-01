import pino from 'pino';

// Safe logger implementation that avoids worker threads in production
const env = process.env.NODE_ENV || 'production';
const isDevelopment = env === 'development';
const isTest = env === 'test';
const shouldUsePino = isDevelopment || isTest;

console.log(
  `[Logger] Initializing logger for env: ${env}. Using Pino: ${shouldUsePino}`,
);

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

// In production (or unknown envs), use a simple console logger to avoid pino/thread-stream worker issues
export const logger = !shouldUsePino
  ? (new ConsoleLogger() as unknown as pino.Logger)
  : pino({
      level: 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
          service: 'shared-core',
          singleLine: false,
        },
      },
    });
