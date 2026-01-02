import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { Redis } from 'ioredis';
import type { MediaReadDto } from '../search-media/media-read.dto';

export interface GetTopRatedMediaQuery {
  limit: number;
}

export class GetTopRatedMediaHandler {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly redis: Redis,
  ) {}

  async execute(query: GetTopRatedMediaQuery): Promise<MediaReadDto[]> {
    const cacheKey = `catalog:top-rated:limit:${query.limit}`;

    // 1. Check Redis Cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      console.log('[GetTopRatedMedia] Cache Hit');
      return JSON.parse(cached);
    }

    console.log('[GetTopRatedMedia] Cache Miss - Fetching from DB...');

    // 2. Fetch from DB
    const results = await this.mediaRepository.findTopRated(query.limit);

    // 3. Set Cache (TTL 300s / 5 min)
    await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 300);

    return results;
  }
}
