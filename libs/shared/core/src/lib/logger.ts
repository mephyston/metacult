import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

export const logger = pino({
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
