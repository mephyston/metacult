/**
 * Type guards natifs TypeScript pour la validation runtime des réponses providers.
 * Remplace Zod pour une validation légère et type-safe.
 */

import type {
  IgdbGameRaw,
  TmdbMovieRaw,
  TmdbTvRaw,
  GoogleBookRaw,
} from '../types/raw-responses';
import { InvalidProviderDataError } from '../../domain/errors/catalog.errors';
import { API_MESSAGES } from '@metacult/shared-core';

/**
 * Valide la structure de réponse d'un jeu IGDB.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateIgdbGame(data: unknown): asserts data is IgdbGameRaw {
  if (!data || typeof data !== 'object') {
    throw new InvalidProviderDataError(
      'igdb',
      API_MESSAGES.VALIDATION.IGDB_NOT_OBJECT,
    );
  }

  const game = data as Record<string, unknown>;

  if (typeof game.id !== 'number') {
    throw new InvalidProviderDataError(
      'igdb',
      API_MESSAGES.VALIDATION.IGDB_INVALID_ID,
    );
  }

  if (!game.name || typeof game.name !== 'string') {
    throw new InvalidProviderDataError(
      'igdb',
      API_MESSAGES.VALIDATION.IGDB_INVALID_NAME,
    );
  }

  // Validation des champs optionnels
  if (
    game.rating !== undefined &&
    game.rating !== null &&
    typeof game.rating !== 'number'
  ) {
    throw new InvalidProviderDataError(
      'igdb',
      API_MESSAGES.VALIDATION.IGDB_INVALID_RATING,
    );
  }

  if (
    game.first_release_date !== undefined &&
    game.first_release_date !== null &&
    typeof game.first_release_date !== 'number'
  ) {
    throw new InvalidProviderDataError(
      'igdb',
      API_MESSAGES.VALIDATION.IGDB_INVALID_RELEASE_DATE,
    );
  }

  if (
    game.platforms !== undefined &&
    game.platforms !== null &&
    !Array.isArray(game.platforms)
  ) {
    throw new InvalidProviderDataError(
      'igdb',
      API_MESSAGES.VALIDATION.IGDB_INVALID_PLATFORMS,
    );
  }
}

/**
 * Valide la structure de réponse d'un film TMDB.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateTmdbMovie(data: unknown): asserts data is TmdbMovieRaw {
  if (!data || typeof data !== 'object') {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_NOT_OBJECT,
    );
  }

  const movie = data as Record<string, unknown>;

  if (typeof movie.id !== 'number') {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_ID,
    );
  }

  if (!movie.title || typeof movie.title !== 'string') {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_TITLE,
    );
  }

  // Vérifie que le media_type est 'movie' pour la cohérence
  if (movie.media_type !== 'movie' && movie.media_type !== undefined) {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_MEDIA_TYPE_MOVIE,
    );
  }

  if (
    movie.vote_average !== undefined &&
    movie.vote_average !== null &&
    typeof movie.vote_average !== 'number'
  ) {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_VOTE_AVERAGE,
    );
  }
}

/**
 * Valide la structure de réponse d'une série TV TMDB.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateTmdbTv(data: unknown): asserts data is TmdbTvRaw {
  if (!data || typeof data !== 'object') {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_NOT_OBJECT,
    );
  }

  const tv = data as Record<string, unknown>;

  if (typeof tv.id !== 'number') {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_ID,
    );
  }

  if (!tv.name || typeof tv.name !== 'string') {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_NAME,
    );
  }

  // Vérifie que le media_type est 'tv' pour la cohérence
  if (tv.media_type !== 'tv' && tv.media_type !== undefined) {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_MEDIA_TYPE_TV,
    );
  }

  if (
    tv.vote_average !== undefined &&
    tv.vote_average !== null &&
    typeof tv.vote_average !== 'number'
  ) {
    throw new InvalidProviderDataError(
      'tmdb',
      API_MESSAGES.VALIDATION.TMDB_INVALID_VOTE_AVERAGE,
    );
  }
}

/**
 * Valide la structure de réponse d'un livre Google Books.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateGoogleBook(
  data: unknown,
): asserts data is GoogleBookRaw {
  if (!data || typeof data !== 'object') {
    throw new InvalidProviderDataError(
      'google_books',
      API_MESSAGES.VALIDATION.GOOGLE_BOOKS_NOT_OBJECT,
    );
  }

  const book = data as Record<string, unknown>;

  if (!book.id || typeof book.id !== 'string') {
    throw new InvalidProviderDataError(
      'google_books',
      API_MESSAGES.VALIDATION.GOOGLE_BOOKS_INVALID_ID,
    );
  }

  if (!book.volumeInfo || typeof book.volumeInfo !== 'object') {
    throw new InvalidProviderDataError(
      'google_books',
      API_MESSAGES.VALIDATION.GOOGLE_BOOKS_INVALID_VOLUME_INFO,
    );
  }

  const volumeInfo = book.volumeInfo as Record<string, unknown>;

  if (!volumeInfo.title || typeof volumeInfo.title !== 'string') {
    throw new InvalidProviderDataError(
      'google_books',
      API_MESSAGES.VALIDATION.GOOGLE_BOOKS_INVALID_TITLE,
    );
  }

  // Optional arrays validation
  if (
    volumeInfo.authors !== undefined &&
    volumeInfo.authors !== null &&
    !Array.isArray(volumeInfo.authors)
  ) {
    throw new InvalidProviderDataError(
      'google_books',
      API_MESSAGES.VALIDATION.GOOGLE_BOOKS_INVALID_AUTHORS,
    );
  }
}
