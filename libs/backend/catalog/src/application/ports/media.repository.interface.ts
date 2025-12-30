import type { Media, MediaType } from '../../domain/entities/media.entity';

export interface MediaSearchFilters {
    type?: MediaType;
    tag?: string; // slug search
    search?: string; // title search
}

import type { MediaReadDto } from '../queries/search-media/media-read.dto';

export interface IMediaRepository {
    findById(id: string): Promise<Media | null>;
    search(filters: MediaSearchFilters): Promise<Media[]>;
    searchViews(filters: MediaSearchFilters): Promise<MediaReadDto[]>;
    create(media: Media): Promise<void>;
    findByProviderId(provider: string, externalId: string): Promise<Media | null>;
    nextId(): string;
}
