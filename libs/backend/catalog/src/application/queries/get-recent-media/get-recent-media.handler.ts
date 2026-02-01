import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { GetRecentMediaQuery } from './get-recent-media.query';
import type { RecentMediaReadModel } from '../../../domain/read-models/recent-media.read-model';
import { logger } from '@metacult/backend-infrastructure';

import type { Redis } from 'ioredis';

import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

export class GetRecentMediaHandler {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly redis: Redis,
  ) {}

  async execute(
    query: GetRecentMediaQuery,
  ): Promise<Result<RecentMediaReadModel[], AppError>> {
    try {
      const cacheKey = `catalog:recent:limit:${query.limit}`;

      // 1. Check Redis Cache
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        logger.info('[GetRecentMedia] Cache Hit');
        return Result.ok(JSON.parse(cached));
      }

      logger.info('[GetRecentMedia] Cache Miss - Fetching from DB');

      // 2. Fetch from DB
      const views = await this.mediaRepository.findMostRecent(query.limit);

      const results = views.map((view) => ({
        id: view.id,
        title: view.title,
        releaseYear: view.releaseYear,
        type: view.type as any,
        posterUrl: view.coverUrl || null,
        tags: (view as any).tags || [],
      }));

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
