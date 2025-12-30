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
        const normalizedSearch = query.search.trim().toLowerCase();
        const cacheKey = `discovery:feed:${normalizedSearch}`;

        // 1. Check Redis Cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            console.log(`[MixedFeed] Cache Hit pour "${query.search}"`);
            return JSON.parse(cached);
        }

        console.log(`[MixedFeed] Cache Miss pour "${query.search}" - Fetching dependencies...`);

        // 2. Fetch Dependencies (Resilient)
        const results = await Promise.allSettled([
            this.mediaSearcher.search(query.search),
            this.adsProvider.getAds()
        ]);

        const [mediaRes, adsRes] = results;
        const mediaItems = mediaRes.status === 'fulfilled' ? mediaRes.value : [];
        const ads = adsRes.status === 'fulfilled' ? adsRes.value : [];

        // Log failures but don't crash
        if (mediaRes.status === 'rejected') {
            console.error('[MixedFeed] Media Searcher Error:', mediaRes.reason);
        }
        if (adsRes.status === 'rejected') {
            console.error('[MixedFeed] Ads Provider Error:', adsRes.reason);
        }

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

        // 4. Set Cache (TTL 1h)
        await this.redis.set(cacheKey, JSON.stringify(mixedFeed), 'EX', 3600);
        console.log(`[MixedFeed] Cached ${mixedFeed.length} items`);

        return mixedFeed;
    }
}
