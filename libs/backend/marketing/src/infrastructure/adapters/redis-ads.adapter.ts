import { Redis } from 'ioredis';
import { logger } from '@metacult/backend-infrastructure';
import type { AdsGateway } from '../../application/ports/ads.gateway.interface';
import { Ad } from '../../domain/ad.entity';

const CACHE_KEY = 'marketing:ads:active';
const CACHE_TTL_SECONDS = 1800; // 30 minutes

/**
 * Redis-backed implementation of AdsGateway.
 * Uses cache-first strategy: returns cached ads if available,
 * otherwise fetches from external provider (simulated) and caches result.
 */
export class RedisAdsAdapter implements AdsGateway {
  constructor(private readonly redis: Redis) {}

  async getActiveAds(): Promise<Ad[]> {
    // 1. Try Cache
    const cached = await this.redis.get(CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2. Fetch from external provider (simulated)
    logger.info('[Marketing] Fetching active ads from external provider');
    const ads: Ad[] = [
      new Ad({
        id: 'ad-1',
        title: 'Buy Metacult Pro',
        type: 'SPONSORED',
        url: 'https://metacult.com/pro',
      }),
      new Ad({
        id: 'ad-2',
        title: 'New Game Release',
        type: 'SPONSORED',
        url: 'https://example.com/game',
      }),
      new Ad({
        id: 'ad-3',
        title: 'Energy Drink',
        type: 'SPONSORED',
        url: 'https://example.com/drink',
      }),
      new Ad({
        id: 'ad-4',
        title: 'Gaming Chair',
        type: 'SPONSORED',
        url: 'https://example.com/chair',
      }),
      new Ad({
        id: 'ad-5',
        title: 'Headset',
        type: 'SPONSORED',
        url: 'https://example.com/headset',
      }),
    ];

    // 3. Set Cache
    await this.redis.set(
      CACHE_KEY,
      JSON.stringify(ads),
      'EX',
      CACHE_TTL_SECONDS,
    );

    return ads;
  }
}
