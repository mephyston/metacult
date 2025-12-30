/**
 * Native TypeScript type guards for runtime validation of provider responses.
 * These guards replace Zod schemas and provide type-safe validation using native TypeScript.
 */

import type { IgdbGameRaw, TmdbMovieRaw, TmdbTvRaw, GoogleBookRaw } from '../types/raw-responses';
import { InvalidProviderDataError } from '../../domain/errors/catalog.errors';

/**
 * Validates IGDB game response structure.
 * @throws InvalidProviderDataError if validation fails
 */
export function validateIgdbGame(data: unknown): asserts data is IgdbGameRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('igdb', 'Response is not an object');
    }

    const game = data as Record<string, unknown>;

    if (typeof game.id !== 'number') {
        throw new InvalidProviderDataError('igdb', 'Missing or invalid field: id (expected number)');
    }

    if (!game.name || typeof game.name !== 'string') {
        throw new InvalidProviderDataError('igdb', 'Missing or invalid field: name (expected non-empty string)');
    }

    // Optional fields validation (if present, must be correct type)
    if (game.rating !== undefined && game.rating !== null && typeof game.rating !== 'number') {
        throw new InvalidProviderDataError('igdb', 'Invalid field: rating (expected number or null)');
    }

    if (game.first_release_date !== undefined && game.first_release_date !== null && typeof game.first_release_date !== 'number') {
        throw new InvalidProviderDataError('igdb', 'Invalid field: first_release_date (expected number or null)');
    }

    if (game.platforms !== undefined && game.platforms !== null && !Array.isArray(game.platforms)) {
        throw new InvalidProviderDataError('igdb', 'Invalid field: platforms (expected array or null)');
    }
}

/**
 * Validates TMDB movie response structure.
 * @throws InvalidProviderDataError if validation fails
 */
export function validateTmdbMovie(data: unknown): asserts data is TmdbMovieRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('tmdb', 'Response is not an object');
    }

    const movie = data as Record<string, unknown>;

    if (typeof movie.id !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Missing or invalid field: id (expected number)');
    }

    if (!movie.title || typeof movie.title !== 'string') {
        throw new InvalidProviderDataError('tmdb', 'Missing or invalid field: title (expected non-empty string)');
    }

    // Ensure media_type is 'movie' for consistency
    if (movie.media_type !== 'movie' && movie.media_type !== undefined) {
        throw new InvalidProviderDataError('tmdb', 'Invalid media_type (expected "movie")');
    }

    if (movie.vote_average !== undefined && movie.vote_average !== null && typeof movie.vote_average !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Invalid field: vote_average (expected number or null)');
    }
}

/**
 * Validates TMDB TV response structure.
 * @throws InvalidProviderDataError if validation fails
 */
export function validateTmdbTv(data: unknown): asserts data is TmdbTvRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('tmdb', 'Response is not an object');
    }

    const tv = data as Record<string, unknown>;

    if (typeof tv.id !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Missing or invalid field: id (expected number)');
    }

    if (!tv.name || typeof tv.name !== 'string') {
        throw new InvalidProviderDataError('tmdb', 'Missing or invalid field: name (expected non-empty string)');
    }

    // Ensure media_type is 'tv' for consistency
    if (tv.media_type !== 'tv' && tv.media_type !== undefined) {
        throw new InvalidProviderDataError('tmdb', 'Invalid media_type (expected "tv")');
    }

    if (tv.vote_average !== undefined && tv.vote_average !== null && typeof tv.vote_average !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Invalid field: vote_average (expected number or null)');
    }
}

/**
 * Validates Google Books response structure.
 * @throws InvalidProviderDataError if validation fails
 */
export function validateGoogleBook(data: unknown): asserts data is GoogleBookRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('google_books', 'Response is not an object');
    }

    const book = data as Record<string, unknown>;

    if (!book.id || typeof book.id !== 'string') {
        throw new InvalidProviderDataError('google_books', 'Missing or invalid field: id (expected non-empty string)');
    }

    if (!book.volumeInfo || typeof book.volumeInfo !== 'object') {
        throw new InvalidProviderDataError('google_books', 'Missing or invalid field: volumeInfo (expected object)');
    }

    const volumeInfo = book.volumeInfo as Record<string, unknown>;

    if (!volumeInfo.title || typeof volumeInfo.title !== 'string') {
        throw new InvalidProviderDataError('google_books', 'Missing or invalid field: volumeInfo.title (expected non-empty string)');
    }

    // Optional arrays validation
    if (volumeInfo.authors !== undefined && volumeInfo.authors !== null && !Array.isArray(volumeInfo.authors)) {
        throw new InvalidProviderDataError('google_books', 'Invalid field: volumeInfo.authors (expected array or null)');
    }
}
