import type { IMediaProvider } from '../../application/ports/media-provider.interface';
import type { Media } from '../../domain/entities/media.entity';
import { MediaType } from '../../domain/entities/media.entity';
import type { IgdbProvider } from '../providers/igdb.provider';
import type { TmdbProvider } from '../providers/tmdb.provider';
import type { GoogleBooksProvider } from '../providers/google-books.provider';
import { mapGameToEntity, mapMovieToEntity, mapTvToEntity, mapBookToEntity } from './mappers';
import type { IgdbGameRaw, TmdbMovieRaw, TmdbTvRaw, GoogleBookRaw } from '../types/raw-responses';

export class IgdbAdapter implements IMediaProvider {
    constructor(private readonly provider: IgdbProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawGames = await this.provider.searchGames(query);
        // Helper to safely cast
        return rawGames.map(game => mapGameToEntity(game as IgdbGameRaw));
    }

    // IgdbAdapter
    async getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null> {
        if (type !== MediaType.GAME) return null;
        const raw = await this.provider.getGameDetails(id);
        if (!raw) return null;
        return mapGameToEntity(raw as IgdbGameRaw, targetId);
    }
}

export class TmdbAdapter implements IMediaProvider {
    constructor(private readonly provider: TmdbProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawResults = await this.provider.searchMulti(query);
        // We only map movies and tv from the mixed results
        return rawResults
            .map((item: any) => {
                if (item.media_type === 'movie') return mapMovieToEntity(item as TmdbMovieRaw);
                if (item.media_type === 'tv') return mapTvToEntity(item as TmdbTvRaw);
                return null;
            })
            .filter((item) => item !== null) as Media[];
    }

    async getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null> {
        if (type === MediaType.MOVIE) {
            const raw = await this.provider.getDetails(id, 'movie');
            if (!raw) return null;
            return mapMovieToEntity(raw as TmdbMovieRaw, targetId);
        } else if (type === MediaType.TV) {
            const raw = await this.provider.getDetails(id, 'tv');
            if (!raw) return null;
            return mapTvToEntity(raw as TmdbTvRaw, targetId);
        }
        return null;
    }
}

export class GoogleBooksAdapter implements IMediaProvider {
    constructor(private readonly provider: GoogleBooksProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawBooks = await this.provider.searchBooks(query);
        return rawBooks.map(b => mapBookToEntity(b as GoogleBookRaw));
    }

    async getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null> {
        if (type !== MediaType.BOOK) return null;
        const raw = await this.provider.getBookDetails(id);
        if (!raw) return null;
        return mapBookToEntity(raw as GoogleBookRaw, targetId);
    }
}
