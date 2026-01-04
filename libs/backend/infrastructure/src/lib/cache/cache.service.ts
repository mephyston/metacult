import { redisClient } from '../redis/redis.client';
import { logger } from '../logger/logger.service';

export class CacheService {
  private redis = redisClient;
  private defaultTtl = 3600; // 1 hour default

  /**
   * Récupère une valeur typée du cache.
   * @template T
   * @param {string} key - Clé Redis.
   * @returns {Promise<T | null>} La donnée désérialisée ou null.
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.warn({ err: error, key }, '[Cache] GET failed');
      return null; // Fail Open
    }
  }

  /**
   * Stocke une valeur dans le cache avec un TTL.
   * @param {string} key - Clé.
   * @param {any} value - Donnée à sérialiser.
   * @param {number} ttlSeconds - Durée de vie en secondes (défaut 1h).
   */
  async set(
    key: string,
    value: any,
    ttlSeconds: number = this.defaultTtl,
  ): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.redis.set(key, serialized, 'EX', ttlSeconds);
    } catch (error) {
      logger.warn({ err: error, key }, '[Cache] SET failed');
    }
  }

  /**
   * Supprime une clé du cache.
   */
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.warn({ err: error, key }, '[Cache] DEL failed');
    }
  }

  /**
   * Pattern Cache-Aside (Look-Aside).
   * 1. Cherche dans le cache.
   * 2. Si absent (Miss), exécute la fonction `fetcher` (Source of Truth).
   * 3. Met en cache le résultat et le retourne.
   *
   * Tolérance aux pannes (Fail-Open) : Si Redis est down, exécute directement le fetcher.
   *
   * @template T
   * @param {string} key - Clé de cache.
   * @param {() => Promise<T>} fetcher - Fonction asynchrone pour récupérer la donnée fraîche.
   * @param {number} ttlSeconds - TTL.
   * @returns {Promise<T>} Le résultat (du cache ou de la source).
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = this.defaultTtl,
  ): Promise<T> {
    // 1. Try to get from cache
    try {
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }
    } catch (error) {
      logger.warn(
        { err: error, key },
        '[Cache] Retrieval error - bypassing cache',
      );
    }

    // 2. Cache MISS: Execute fetcher
    const result = await fetcher();

    // 3. Set cache (Fail safe)
    if (result !== undefined && result !== null) {
      // We await here to ensure data is likely cached, but we verify set errors inside set()
      await this.set(key, result, ttlSeconds);
    }

    return result;
  }
}

export const cacheService = new CacheService();
// console.log('✅ [Infrastructure] CacheService Initialized', !!cacheService);
