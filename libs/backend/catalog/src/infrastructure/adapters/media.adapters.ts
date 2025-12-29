import type { IMediaProvider } from '../../application/ports/media-provider.interface';
import type { Media } from '../../domain/entities/media.entity';
import { MediaType } from '../../domain/entities/media.entity';
import type { IgdbProvider } from '../providers/igdb.provider';
import type { TmdbProvider } from '../providers/tmdb.provider';
import type { GoogleBooksProvider } from '../providers/google-books.provider';
import { mapGameToEntity, mapMovieToEntity, mapTvToEntity, mapBookToEntity } from './mappers';
import type { IgdbGameRaw, TmdbMovieRaw, TmdbTvRaw, GoogleBookRaw } from '../../domain/types/provider-responses';

export class IgdbAdapter implements IMediaProvider {
    constructor(private readonly provider: IgdbProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawGames = await this.provider.searchGames(query);
        return rawGames.map(game => mapGameToEntity(game as IgdbGameRaw).media as Media);
    }

    async getMedia(id: string, type: MediaType): Promise<Media | null> {
        if (type !== MediaType.GAME) return null;
        const raw = await this.provider.getGameDetails(id);
        if (!raw) return null;
        return mapGameToEntity(raw as IgdbGameRaw).media as Media;
    }
}

export class TmdbAdapter implements IMediaProvider {
    constructor(private readonly provider: TmdbProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawResults = await this.provider.searchMulti(query);
        // We only map movies and tv from the mixed results
        return rawResults
            .map((item: any) => {
                if (item.media_type === 'movie') return mapMovieToEntity(item as TmdbMovieRaw).media as Media;
                if (item.media_type === 'tv') return mapTvToEntity(item as TmdbTvRaw).media as Media;
                return null;
            })
            .filter((item): item is Media => item !== null);
    }

    async getMedia(id: string, type: MediaType): Promise<Media | null> {
        if (type === MediaType.MOVIE) {
            const raw = await this.provider.getDetails(id, 'movie');
            if (!raw) return null;
            return mapMovieToEntity(raw as TmdbMovieRaw).media as Media;
        } else if (type === MediaType.TV) {
            const raw = await this.provider.getDetails(id, 'tv');
            if (!raw) return null;
            return mapTvToEntity(raw as TmdbTvRaw).media as Media;
        }
        return null;
    }
}

export class GoogleBooksAdapter implements IMediaProvider {
    constructor(private readonly provider: GoogleBooksProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawBooks = await this.provider.searchBooks(query);
        return rawBooks.map(b => mapBookToEntity(b as GoogleBookRaw).media as Media);
    }

    async getMedia(id: string, type: MediaType): Promise<Media | null> {
        if (type !== MediaType.BOOK) return null;
        const raw = await this.provider.getBookDetails(id);
        if (!raw) return null;
        return mapBookToEntity(raw as GoogleBookRaw).media as Media;
    }
}
