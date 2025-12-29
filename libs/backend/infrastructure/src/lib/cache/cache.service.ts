import { redisClient } from '../redis/redis.client';

export class CacheService {
    private redis = redisClient;
    private defaultTtl = 3600; // 1 hour default

    /**
     * Get a typed value from cache
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            console.warn(`⚠️ Cache GET failed for key "${key}":`, error);
            return null; // Fail Open
        }
    }

    /**
     * Set a value in cache with TTL
     */
    async set(key: string, value: any, ttlSeconds: number = this.defaultTtl): Promise<void> {
        try {
            const serialized = JSON.stringify(value);
            await this.redis.set(key, serialized, 'EX', ttlSeconds);
        } catch (error) {
            console.warn(`⚠️ Cache SET failed for key "${key}":`, error);
        }
    }

    /**
     * Delete a key from cache
     */
    async del(key: string): Promise<void> {
        try {
            await this.redis.del(key);
        } catch (error) {
            console.warn(`⚠️ Cache DEL failed for key "${key}":`, error);
        }
    }

    /**
     * Get from cache or execute fetcher and cache result (Cache-Aside Pattern)
     * Fail-Open: If Redis fails, just runs the fetcher.
     */
    async getOrSet<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlSeconds: number = this.defaultTtl
    ): Promise<T> {
        // 1. Try to get from cache
        try {
            const cached = await this.get<T>(key);
            if (cached !== null) {
                return cached;
            }
        } catch (error) {
            console.warn(`⚠️ Cache retrieval error, bypassing cache for key "${key}"`);
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
