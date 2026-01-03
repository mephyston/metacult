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
    private readonly adsProvider: IAdsProvider,
  ) {}

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

    console.log('[MixedFeed] Query received:', {
      search: query.search,
      userId: query.userId,
      excludedCount: query.excludedMediaIds?.length || 0,
      excludedIds: query.excludedMediaIds?.slice(0, 5) || [],
      limit: query.limit,
    });

    // Le cache key doit inclure les exclusions si on veut vraiment cacher...
    // MAIS le cache est surtout utile pour le feed générique.
    // Si on fait du user-specific (exclusion), le cache global devient gênant ou doit être ignoré/prefixé user.
    // Pour l'instant, si userId est présent (feed personnalisé), on BYPASS le cache global de feed (ou on utilise un cache user).
    // Stratégie simple: Cache Off si User context.

    const shouldCache =
      !query.userId &&
      (!query.excludedMediaIds || query.excludedMediaIds.length === 0);
    const cacheKey = `discovery:feed:${normalizedSearch}`;

    // 1. Check Redis Cache (Only for public generic feeds)
    if (shouldCache) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        console.log(`[MixedFeed] Cache Hit pour "${query.search}"`);
        return JSON.parse(cached);
      }
    }

    console.log(
      `[MixedFeed] Cache ${shouldCache ? 'Miss' : 'Bypassed'} pour "${query.search}" - Fetching dependencies...`,
    );

    // 2. Fetch Dependencies (Resilient)
    const results = await Promise.allSettled([
      this.mediaSearcher.search(query.search, {
        excludedIds: query.excludedMediaIds,
        limit: query.limit,
        // Si pas de recherche textuelle, on veut explicitement du Random
        orderBy: !normalizedSearch ? 'random' : undefined,
      }),
      this.adsProvider.getAds(),
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

    // 4. Set Cache (TTL 60s) - Only for public generic feeds
    // Short TTL to ensure guests see new content frequently
    if (shouldCache) {
      await this.redis.set(cacheKey, JSON.stringify(mixedFeed), 'EX', 60);
      console.log(`[MixedFeed] Cached ${mixedFeed.length} items (60s TTL)`);
    }

    return mixedFeed;
  }
}
