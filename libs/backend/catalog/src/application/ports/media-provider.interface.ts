import type { Media, MediaType } from '../../domain/entities/media.entity';

export interface IMediaProvider {
    /**
     * Fetch raw data from external source and map it to a Domain Entity.
     * The adapter is responsible for all mapping logic.
     */
    getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null>;
}
