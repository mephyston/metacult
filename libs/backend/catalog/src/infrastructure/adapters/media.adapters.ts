import type { IMediaProvider } from '../../application/ports/media-provider.interface';
import type { Media } from '../../domain/entities/media.entity';
import { MediaType } from '../../domain/entities/media.entity';
import type { IgdbProvider } from '../providers/igdb.provider';
import type { TmdbProvider } from '../providers/tmdb.provider';
import type { GoogleBooksProvider } from '../providers/google-books.provider';
import { mapGameToEntity, mapMovieToEntity, mapTvToEntity, mapBookToEntity } from './mappers';
import type { IgdbGameRaw, TmdbMovieRaw, TmdbTvRaw, GoogleBookRaw } from '../types/raw-responses';
import { validateIgdbGame, validateTmdbMovie, validateTmdbTv, validateGoogleBook } from './validators';

export class IgdbAdapter implements IMediaProvider {
    constructor(private readonly provider: IgdbProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawGames = await this.provider.searchGames(query);
        
        // Validate each game response before mapping
        return rawGames.map(game => {
            validateIgdbGame(game); // Throws InvalidProviderDataError if invalid
            return mapGameToEntity(game);
        });
    }

    async getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null> {
        if (type !== MediaType.GAME) return null;
        
        const raw = await this.provider.getGameDetails(id);
        if (!raw) return null;
        
        validateIgdbGame(raw); // Validate before mapping
        return mapGameToEntity(raw, targetId);
    }
}

export class TmdbAdapter implements IMediaProvider {
    constructor(private readonly provider: TmdbProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawResults = await this.provider.searchMulti(query);
        
        // Validate and map movies and TV shows
        return rawResults
            .map((item: unknown) => {
                const record = item as Record<string, unknown>;
                
                if (record.media_type === 'movie') {
                    validateTmdbMovie(item); // Throws if invalid
                    return mapMovieToEntity(item as TmdbMovieRaw);
                }
                
                if (record.media_type === 'tv') {
                    validateTmdbTv(item); // Throws if invalid
                    return mapTvToEntity(item as TmdbTvRaw);
                }
                
                return null;
            })
            .filter((item): item is Media => item !== null);
    }

    async getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null> {
        if (type === MediaType.MOVIE) {
            const raw = await this.provider.getDetails(id, 'movie');
            if (!raw) return null;
            
            validateTmdbMovie(raw); // Validate before mapping
            return mapMovieToEntity(raw as TmdbMovieRaw, targetId);
        } else if (type === MediaType.TV) {
            const raw = await this.provider.getDetails(id, 'tv');
            if (!raw) return null;
            
            validateTmdbTv(raw); // Validate before mapping
            return mapTvToEntity(raw as TmdbTvRaw, targetId);
        }
        
        return null;
    }
}

export class GoogleBooksAdapter implements IMediaProvider {
    constructor(private readonly provider: GoogleBooksProvider) { }

    async search(query: string): Promise<Media[]> {
        const rawBooks = await this.provider.searchBooks(query);
        
        // Validate each book response before mapping
        return rawBooks.map(book => {
            validateGoogleBook(book); // Throws InvalidProviderDataError if invalid
            return mapBookToEntity(book);
        });
    }

    async getMedia(id: string, type: MediaType, targetId?: string): Promise<Media | null> {
        if (type !== MediaType.BOOK) return null;
        
        const raw = await this.provider.getBookDetails(id);
        if (!raw) return null;
        
        validateGoogleBook(raw); // Validate before mapping
        return mapBookToEntity(raw, targetId);
    }
}

