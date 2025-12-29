import type { IMediaProvider, Media, Game, Movie, TV, Book } from '@metacult/backend/domain';

import { MediaType } from '@metacult/backend/domain';
import { igdbProvider } from '../providers/igdb.provider';
import { tmdbProvider } from '../providers/tmdb.provider';
import { googleBooksProvider } from '../providers/google-books.provider';
import { v4 as uuidv4 } from 'uuid';
import { mapGameToEntity, mapMovieToEntity, mapTvToEntity, mapBookToEntity } from './mappers';
// Note: We need to move the mappers to Infrastructure/Adapters/Mappers later, 
// for now importing them from where they are or duplicating/moving logic here.
// Actually, Clean Architecture says Adaptors adapt. So the logic should be HERE.
// I will rewrite the mapping logic here to isolate it from the "worker" folder.

export class IgdbAdapter implements IMediaProvider {
    async getMedia(id: string, type: MediaType): Promise<Media> {
        if (type !== MediaType.GAME) throw new Error('IgdbAdapter only supports GAME');
        const raw = await igdbProvider.getGameDetails(id);
        const mapped = mapGameToEntity(raw);
        // We need to change mapGameToEntity to return a clean Entity, 
        // currently it returns { media, subEntity }. Use Case expects full object?
        // Use Case saves "Media". Repository "create" expects "Media".
        // But "Media" interface in Entity is a base. 
        // We need to return "Game" (which extends Media).
        return {
            ...mapped.media,
            ...mapped.game,
        } as Game;
    }
}

export class TmdbAdapter implements IMediaProvider {
    async getMedia(id: string, type: MediaType): Promise<Media> {
        if (type === MediaType.MOVIE) {
            const raw = await tmdbProvider.getDetails(id, 'movie');
            const mapped = mapMovieToEntity(raw);
            return { ...mapped.media, ...mapped.movie } as Movie;
        } else if (type === MediaType.TV) {
            const raw = await tmdbProvider.getDetails(id, 'tv');
            const mapped = mapTvToEntity(raw);
            return { ...mapped.media, ...mapped.tv } as TV;
        }
        throw new Error(`TmdbAdapter does not support ${type}`);
    }
}

export class GoogleBooksAdapter implements IMediaProvider {
    async getMedia(id: string, type: MediaType): Promise<Media> {
        if (type !== MediaType.BOOK) throw new Error('GoogleBooksAdapter only supports BOOK');
        const raw = await googleBooksProvider.getBookDetails(id);
        const mapped = mapBookToEntity(raw);
        return { ...mapped.media, ...mapped.book } as Book;
    }
}
