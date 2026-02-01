import Redis from 'ioredis';
import { configService } from '../config/configuration.service';
import { logger } from '../logger/logger.service';

const redisUrl = configService.redisUrl;

logger.info('[Redis] Initializing client for Cache');

/**
 * Client Redis Singleton (IoRedis).
 * Configuré avec une stratégie de reconnexion exponentielle.
 * Utilisé pour le Cache et BullMQ.
 */
export const redisClient = new Redis(redisUrl, {
  // family: 4, // REMOVED: Railway Private Network uses IPv6 for .internal domains
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy(times) {
    // Exponential backoff with max 2s delay
    return Math.min(times * 50, 2000);
  },
});

redisClient.on('error', (err) => {
  // Log detailed error in Staging/Prod to diagnose connection issues
  if (!configService.isTest) {
    logger.error({ err }, '[Redis] Client error');
  }
});

redisClient.on('connect', () => {
  if (!configService.isStaging) {
    logger.info('[Redis] Client connected');
  }
});
