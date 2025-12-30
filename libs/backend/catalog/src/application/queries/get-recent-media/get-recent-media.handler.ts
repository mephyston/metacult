import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { GetRecentMediaQuery } from './get-recent-media.query';
import type { RecentMediaItemDto } from './recent-media.dto';

import type { Redis } from 'ioredis';

export class GetRecentMediaHandler {
    constructor(
        private readonly mediaRepository: IMediaRepository,
        private readonly redis: Redis
    ) { }

    async execute(query: GetRecentMediaQuery): Promise<RecentMediaItemDto[]> {
        const cacheKey = `catalog:recent:limit:${query.limit}`;

        // 1. Check Redis Cache
        const cached = await this.redis.get(cacheKey);
        if (cached) {
            console.log('[GetRecentMedia] Cache Hit');
            return JSON.parse(cached);
        }

        console.log('[GetRecentMedia] Cache Miss - Fetching from DB...');

        // 2. Fetch from DB
        const views = await this.mediaRepository.findMostRecent(query.limit);

        const results = views.map(view => ({
            id: view.id,
            title: view.title,
            releaseYear: view.releaseYear,
            type: view.type as any,
            posterUrl: view.coverUrl || null,
            tags: (view as any).tags || []
        }));

        // 3. Set Cache (TTL 300s / 5 min)
        await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 300);

        return results;
    }
}
