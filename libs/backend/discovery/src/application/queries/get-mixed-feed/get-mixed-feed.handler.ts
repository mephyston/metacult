import { Redis } from 'ioredis';
import { GetMixedFeedQuery } from './get-mixed-feed.query';
import type { IMediaSearcher } from '../../ports/media-searcher.interface';
import type { IAdsProvider } from '../../ports/ads-provider.interface';

// Types (simplified for this exercise)
export type MixedFeedItem =
    | { type: 'MEDIA'; data: any }
    | { type: 'SPONSORED'; data: any };

/**
 * Cas d'Utilisation (Use Case) : Générer un flux mixte (Contenu + Pubs).
 * Implémente une stratégie de cache aggressive avec Redis et de l'orchestration de ports.
 * 
 * @class GetMixedFeedHandler
 */
export class GetMixedFeedHandler {
    /**
     * @param {Redis} redis - Cache distribué pour stocker le feed calculé.
     * @param {IMediaSearcher} mediaSearcher - Service pour trouver du contenu.
     * @param {IAdsProvider} adsProvider - Service pour trouver des pubs.
     */
    constructor(
        private readonly redis: Redis,
        private readonly mediaSearcher: IMediaSearcher,
        private readonly adsProvider: IAdsProvider
    ) { }

    /**
     * Exécute la query.
     * Algorithme :
     * 1. Vérifie le cache Redis (TTL court).
     * 2. Si miss : Récupère Médias et Pubs en parallèle.
     * 3. Aggregation : Insère 1 pub tous les 5 médias.
     * 4. Mise en cache du résultat.
     * 
     * @param {GetMixedFeedQuery} query - Paramètres de recherche.
     * @returns {Promise<MixedFeedItem[]>} Le flux composite.
     */
    async execute(query: GetMixedFeedQuery): Promise<MixedFeedItem[]> {
        const cacheKey = `discovery:feed:${query.search}`;

        // 1. Check Short-lived Cache (30s)
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Fetch Dependencies
        // Using injected Ports
        const [mediaItems, ads] = await Promise.all([
            this.mediaSearcher.search(query.search),
            this.adsProvider.getAds()
        ]);

        // 3. Mix Logic (1 Ad per 5 Media items)
        const mixedFeed: MixedFeedItem[] = [];
        let mediaIndex = 0;
        let adIndex = 0;

        while (mediaIndex < mediaItems.length) {
            // Take chunk of 5 media
            const chunk = mediaItems.slice(mediaIndex, mediaIndex + 5);
            chunk.forEach((m: any) => mixedFeed.push({ type: 'MEDIA', data: m }));
            mediaIndex += 5;

            // Insert 1 Ad if available
            if (adIndex < ads.length) {
                mixedFeed.push({ type: 'SPONSORED', data: ads[adIndex] });
                adIndex++;
            }
        }

        // 4. Set Cache
        await this.redis.set(cacheKey, JSON.stringify(mixedFeed), 'EX', 30);

        return mixedFeed;
    }
}
