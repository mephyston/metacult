import Redis from 'ioredis';
import { configService } from '../config/configuration.service';
import { logger } from '../logger/logger.service';

const redisUrl = configService.get('REDIS_URL');

logger.info('[Redis] Initializing client for Cache');

/**
 * Client Redis Singleton (IoRedis).
 * Configuré avec une stratégie de reconnexion exponentielle.
 * Utilisé pour le Cache et BullMQ.
 */
export const redisClient = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    // Exponential backoff with max 2s delay
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redisClient.on('error', (err) => {
  // Silent error logs in test/staging to avoid noise if redis flaps
  if (configService.isProduction) {
    logger.error({ err }, '[Redis] Client error');
  }
});

redisClient.on('connect', () => {
  if (!configService.isStaging) {
    logger.info('[Redis] Client connected');
  }
});
