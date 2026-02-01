import {
  type MediaDetails,
  type MediaDetailsProvider,
} from '../../domain/gateway/MediaDetailsProvider';
import { DrizzleMediaRepository, asMediaId } from '@metacult/backend-catalog';

export class CatalogMediaDetailsProvider implements MediaDetailsProvider {
  constructor(private readonly mediaRepository: DrizzleMediaRepository) {}

  async getMediaDetails(mediaId: string): Promise<MediaDetails | null> {
    const media = await this.mediaRepository.findById(asMediaId(mediaId));
    if (!media) return null;

    const tmdbId =
      media.externalReference.provider === 'tmdb'
        ? media.externalReference.id
        : undefined;

    return {
      id: media.id,
      title: media.title,
      type: media.type as 'movie' | 'tv' | 'game' | 'book',
      tmdbId,
      isbn: undefined,
    };
  }
}
