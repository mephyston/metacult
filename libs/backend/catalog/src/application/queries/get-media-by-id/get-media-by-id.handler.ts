import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { GetMediaByIdQuery } from './get-media-by-id.query';
import type { MediaDetailReadModel } from '../../../domain/read-models/media-detail.read-model';
import { MediaType } from '../../../domain/entities/media.entity';
import { asMediaId } from '../../../domain/value-objects/media-id.vo';
import { MediaNotFoundInProviderError } from '../../../domain/errors/catalog.errors';
import { logger } from '@metacult/backend-infrastructure';
import { Result, type AppError } from '@metacult/shared-core';

import type { Redis } from 'ioredis';

export class GetMediaByIdHandler {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly redis: Redis,
  ) {}

  async execute(
    query: GetMediaByIdQuery,
  ): Promise<Result<MediaDetailReadModel, AppError>> {
    const cacheKey = `catalog:media:${query.id}`;

    // 1. Check Redis Cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      logger.info({ mediaId: query.id }, '[GetMediaById] Cache Hit');
      return Result.ok(JSON.parse(cached));
    }

    logger.info(
      { mediaId: query.id },
      '[GetMediaById] Cache Miss - Fetching from DB',
    );

    // 2. Fetch from DB
    let media;
    // Simple regex for UUID v4
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        query.id,
      );

    if (isUuid) {
      media = await this.mediaRepository.findById(asMediaId(query.id));
    } else {
      // Fallback to Slug
      media = await this.mediaRepository.findBySlug(query.id);
    }

    if (!media) {
      return Result.fail(new MediaNotFoundInProviderError(query.id, 'Catalog'));
    }

    // 3. Map to DTO
    // 3. Map to DTO
    const mediaWithStats = media as unknown as {
      id: string;
      slug: string;
      title: string;
      type: string;
      releaseYear?: { getValue: () => number };
      coverUrl?: { getValue: () => string };
      rating?: { getValue: () => number };
      description: string;
      eloScore?: number;
      matchCount?: number;
      props?: Record<string, unknown>;
    };

    const dto: MediaDetailReadModel = {
      id: mediaWithStats.id,
      slug: mediaWithStats.slug,
      title: mediaWithStats.title,
      type: mediaWithStats.type as MediaType,
      releaseYear: mediaWithStats.releaseYear?.getValue() || null,
      posterUrl: mediaWithStats.coverUrl?.getValue() || null,
      rating: mediaWithStats.rating?.getValue() || null,
      eloScore: mediaWithStats.eloScore || 1000,
      matchCount: mediaWithStats.matchCount || 0,
      description: mediaWithStats.description,
      tags: [],
      metadata: {
        ...(mediaWithStats.props || {}),
      },
    };

    // 4. Set Cache (TTL 1h = 3600s)
    await this.redis.set(cacheKey, JSON.stringify(dto), 'EX', 3600);

    return Result.ok(dto);
  }
}
