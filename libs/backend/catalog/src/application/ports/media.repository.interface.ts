import type { Media, MediaType } from '../../domain/entities/media.entity';

export interface MediaSearchFilters {
    type?: MediaType;
    tag?: string; // slug search
    search?: string; // title search
}

export interface IMediaRepository {
    findById(id: string): Promise<Media | null>;
    search(filters: MediaSearchFilters): Promise<Media[]>;
    create(media: Media): Promise<void>;
    nextId(): string;
}
