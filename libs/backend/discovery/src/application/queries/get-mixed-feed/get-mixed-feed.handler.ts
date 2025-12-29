import { Redis } from 'ioredis';
import { SearchMediaHandler, SearchMediaQuery, MediaType } from '@metacult/backend/catalog';
import { GetActiveAdsHandler, GetActiveAdsQuery } from '@metacult/backend/marketing';
import { GetMixedFeedQuery } from './get-mixed-feed.query';

// Types (simplified for this exercise)
export type MixedFeedItem =
    | { type: 'MEDIA'; data: any }
    | { type: 'SPONSORED'; data: any };

export class GetMixedFeedHandler {
    constructor(
        private readonly redis: Redis,
        private readonly searchMediaHandler: SearchMediaHandler,
        private readonly adsHandler: GetActiveAdsHandler
    ) { }

    async execute(query: GetMixedFeedQuery): Promise<MixedFeedItem[]> {
        const cacheKey = `discovery:feed:${query.search}`;

        // 1. Check Short-lived Cache (30s)
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        // 2. Fetch Dependencies
        // Using Catalog's SearchMediaHandler directly (Module communication)
        const [mediaItems, ads] = await Promise.all([
            this.searchMediaHandler.execute(new SearchMediaQuery(query.search)),
            this.adsHandler.execute(new GetActiveAdsQuery())
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
