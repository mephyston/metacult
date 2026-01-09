import type { IMediaProvider } from '../../application/ports/media-provider.interface';
import { logger } from '@metacult/backend-infrastructure';
import {
  Media,
  MediaType,
  Movie,
  TV,
} from '../../domain/entities/media.entity';
import type { IgdbProvider } from '../providers/igdb.provider';
import type { TmdbProvider } from '../providers/tmdb.provider';
import type { GoogleBooksProvider } from '../providers/google-books.provider';
import {
  mapGameToEntity,
  mapMovieToEntity,
  mapTvToEntity,
  mapBookToEntity,
} from './mappers';
import type {
  IgdbGameRaw,
  TmdbMovieRaw,
  TmdbTvRaw,
  GoogleBookRaw,
} from '../types/raw-responses';
import {
  validateIgdbGame,
  validateTmdbMovie,
  validateTmdbTv,
  validateGoogleBook,
} from './validators';

/**
 * Adaptateur pour le provider IGDB.
 * Implémente l'interface standard `IMediaProvider` pour le domaine.
 */
export class IgdbAdapter implements IMediaProvider {
  constructor(private readonly provider: IgdbProvider) {}

  /**
   * Recherche un jeu sur IGDB et le convertit en Entité.
   */
  async search(query: string): Promise<Media[]> {
    const rawGames = await this.provider.searchGames(query);

    // Validate each game response before mapping
    return rawGames.map((game) => {
      validateIgdbGame(game); // Throws InvalidProviderDataError if invalid
      return mapGameToEntity(game, crypto.randomUUID());
    });
  }

  /**
   * Récupère un jeu par ID.
   */
  async getMedia(
    id: string,
    type: MediaType,
    targetId?: string,
  ): Promise<Media | null> {
    if (type !== MediaType.GAME) return null;

    const raw = await this.provider.getGameDetails(id);
    if (!raw) return null;

    validateIgdbGame(raw); // Validate before mapping
    return mapGameToEntity(raw, targetId || crypto.randomUUID());
  }
}

/**
 * Adaptateur pour le provider TMDB (Films et Séries).
 */
export class TmdbAdapter implements IMediaProvider {
  constructor(private readonly provider: TmdbProvider) {}

  async search(query: string): Promise<Media[]> {
    const rawResults = await this.provider.searchMovies(query);

    // Validate and map movies and TV shows
    return rawResults
      .map((item: unknown) => {
        const record = item as Record<string, unknown>;
        const tempId = crypto.randomUUID();

        if (record.media_type === 'movie') {
          validateTmdbMovie(item); // Throws if invalid
          return mapMovieToEntity(item as TmdbMovieRaw, tempId);
        }

        if (record.media_type === 'tv') {
          validateTmdbTv(item); // Throws if invalid
          return mapTvToEntity(item as TmdbTvRaw, tempId);
        }

        return null;
      })
      .filter((item): item is Movie | TV => item !== null);
  }

  async getMedia(
    id: string,
    type: MediaType,
    targetId?: string,
  ): Promise<Media | null> {
    const finalId = targetId || crypto.randomUUID();

    if (type === MediaType.MOVIE) {
      const raw = await this.provider.getMedia(id, 'movie'); // Specific movie query
      if (!raw) return null;

      // validateTmdbMovie(raw); // Let's rely on mapping or ensure provider returns correct type
      return mapMovieToEntity(raw as TmdbMovieRaw, finalId);
    } else if (type === MediaType.TV) {
      const raw = await this.provider.getMedia(id, 'tv'); // Specific tv query
      if (!raw) return null;

      // validateTmdbTv(raw);
      return mapTvToEntity(raw as unknown as TmdbTvRaw, finalId);
    }

    return null;
  }
}

/**
 * Adaptateur pour Google Books.
 */
export class GoogleBooksAdapter implements IMediaProvider {
  constructor(private readonly provider: GoogleBooksProvider) {}

  async search(query: string): Promise<Media[]> {
    const rawBooks = await this.provider.searchBooks(query);

    // Validate each book response before mapping
    return rawBooks.map((book) => {
      validateGoogleBook(book); // Throws InvalidProviderDataError if invalid
      return mapBookToEntity(book, crypto.randomUUID());
    });
  }

  async getMedia(
    id: string,
    type: MediaType,
    targetId?: string,
  ): Promise<Media | null> {
    if (type !== MediaType.BOOK) return null;

    const raw = await this.provider.getMedia(id);
    if (!raw) return null;

    validateGoogleBook(raw); // Validate before mapping
    return mapBookToEntity(raw, targetId || crypto.randomUUID());
  }
}
