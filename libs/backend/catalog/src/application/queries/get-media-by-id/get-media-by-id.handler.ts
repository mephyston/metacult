import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { GetMediaByIdQuery } from './get-media-by-id.query';
import type { MediaDetailDto } from './media-detail.dto';
import { MediaNotFoundInProviderError } from '../../../domain/errors/catalog.errors';
import { logger } from '@metacult/backend-infrastructure';

import type { Redis } from 'ioredis';

export class GetMediaByIdHandler {
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly redis: Redis,
  ) {}

  async execute(query: GetMediaByIdQuery): Promise<MediaDetailDto> {
    const cacheKey = `catalog:media:${query.id}`;

    // 1. Check Redis Cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      logger.info({ mediaId: query.id }, '[GetMediaById] Cache Hit');
      return JSON.parse(cached);
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
      media = await this.mediaRepository.findById(query.id);
    } else {
      // Fallback to Slug
      media = await this.mediaRepository.findBySlug(query.id);
    }

    if (!media) {
      // Using a generic error message as we don't know the provider here, or 'System'
      throw new MediaNotFoundInProviderError(query.id, 'Catalog');
    }

    // 3. Map to DTO
    const dto: MediaDetailDto = {
      id: media.id,
      slug: media.slug,
      title: media.title, // Primitive string
      type: media.type as any, // Cast to avoid enum import issues if strict
      releaseYear: media.releaseYear?.getValue() || null,
      posterUrl: media.coverUrl?.getValue() || null,
      rating: media.rating?.getValue() || null,
      eloScore: (media as any).eloScore || 1000,
      matchCount: (media as any).matchCount || 0,
      description: media.description,
      tags: [], // Tags not yet available on entity
      metadata: {
        ...(media as any).props,
      },
    };

    // Note: Repository findById usually returns Domain Entity.
    // We might need to ensure Tags are loaded or use a View Model repository method if Entity is too raw.
    // For now, assuming standard entity mapping.

    // 4. Set Cache (TTL 1h = 3600s)
    await this.redis.set(cacheKey, JSON.stringify(dto), 'EX', 3600);

    return dto;
  }
}
