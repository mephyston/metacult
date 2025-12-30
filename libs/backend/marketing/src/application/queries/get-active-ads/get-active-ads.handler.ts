import { Redis } from 'ioredis';
import type { GetActiveAdsQuery } from './get-active-ads.query';
import type { Ad } from '../../../domain/ad.entity';

/**
 * Cas d'Utilisation : Récupérer les campagnes pubs actives.
 * Simule un appel externe (Vendor) et met en cache pour réduire latence et coûts.
 * 
 * @class GetActiveAdsHandler
 */
export class GetActiveAdsHandler {
    constructor(private readonly redis: Redis) { }

    /**
     * Récupère les pubs.
     * Stratégie : Cache-First. Si expiré, simule un fetch et met en cache pour 30 minutes.
     * 
     * @param {GetActiveAdsQuery} query - DTO vide.
     * @returns {Promise<Ad[]>} Liste de pubs.
     */
    async execute(query: GetActiveAdsQuery): Promise<Ad[]> {
        const cacheKey = 'marketing:ads:active';

        // 1. Try Cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Simulate Fetch (Miss)
        console.log(`📣 [Marketing] Récupération des pubs actives depuis le fournisseur externe...`);
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
