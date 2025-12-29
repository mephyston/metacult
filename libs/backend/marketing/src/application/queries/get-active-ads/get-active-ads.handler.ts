import { Redis } from 'ioredis';
import type { GetActiveAdsQuery } from './get-active-ads.query';
import type { Ad } from '../../../domain/ad.entity';

export class GetActiveAdsHandler {
    constructor(private readonly redis: Redis) { }

    async execute(query: GetActiveAdsQuery): Promise<Ad[]> {
        const cacheKey = 'marketing:ads:active';

        // 1. Try Cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Simulate Fetch (Miss)
        console.log(`📣 [Marketing] Fetching Active Ads from external vendor...`);
        const ads: Ad[] = [
            { id: 'ad-1', title: 'Buy Metacult Pro', type: 'SPONSORED', url: 'https://metacult.com/pro' },
            { id: 'ad-2', title: 'New Game Release', type: 'SPONSORED', url: 'https://example.com/game' },
            { id: 'ad-3', title: 'Energy Drink', type: 'SPONSORED', url: 'https://example.com/drink' },
            { id: 'ad-4', title: 'Gaming Chair', type: 'SPONSORED', url: 'https://example.com/chair' },
            { id: 'ad-5', title: 'Headset', type: 'SPONSORED', url: 'https://example.com/headset' },
        ];

        // 3. Set Cache (TTL 30 min = 1800s)
        await this.redis.set(cacheKey, JSON.stringify(ads), 'EX', 1800);

        return ads;
    }
}
