import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { Redis } from 'ioredis';
import type { MediaReadModel } from '../../../domain/read-models/media-read.model';
import { logger } from '@metacult/backend-infrastructure';

import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

export interface GetTopRatedMediaQuery {
  limit: number;
}

export class GetTopRatedMediaHandler {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly redis: Redis,
  ) {}

  async execute(
    query: GetTopRatedMediaQuery,
  ): Promise<Result<MediaReadModel[]>> {
    try {
      const cacheKey = `catalog:top-rated:limit:${query.limit}`;

      // 1. Check Redis Cache
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.info('[GetTopRatedMedia] Cache Hit');
        return Result.ok(JSON.parse(cached));
      }

      logger.info('[GetTopRatedMedia] Cache Miss - Fetching from DB');

      // 2. Fetch from DB
      const results = await this.mediaRepository.findTopRated(query.limit);

      // 3. Set Cache (TTL 300s / 5 min)
      await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 300);

      return Result.ok(results);
    } catch (error) {
      return Result.fail(
        error instanceof AppError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }
}
