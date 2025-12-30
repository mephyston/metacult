/**
 * Type guards natifs TypeScript pour la validation runtime des réponses providers.
 * Remplace Zod pour une validation légère et type-safe.
 */

import type { IgdbGameRaw, TmdbMovieRaw, TmdbTvRaw, GoogleBookRaw } from '../types/raw-responses';
import { InvalidProviderDataError } from '../../domain/errors/catalog.errors';

/**
 * Valide la structure de réponse d'un jeu IGDB.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateIgdbGame(data: unknown): asserts data is IgdbGameRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('igdb', 'La réponse n\'est pas un objet');
    }

    const game = data as Record<string, unknown>;

    if (typeof game.id !== 'number') {
        throw new InvalidProviderDataError('igdb', 'Champ manquant ou invalide : id (attendu : number)');
    }

    if (!game.name || typeof game.name !== 'string') {
        throw new InvalidProviderDataError('igdb', 'Champ manquant ou invalide : name (attendu : string non vide)');
    }

    // Validation des champs optionnels
    if (game.rating !== undefined && game.rating !== null && typeof game.rating !== 'number') {
        throw new InvalidProviderDataError('igdb', 'Champ invalide : rating (attendu : number ou null)');
    }

    if (game.first_release_date !== undefined && game.first_release_date !== null && typeof game.first_release_date !== 'number') {
        throw new InvalidProviderDataError('igdb', 'Champ invalide : first_release_date (attendu : number ou null)');
    }

    if (game.platforms !== undefined && game.platforms !== null && !Array.isArray(game.platforms)) {
        throw new InvalidProviderDataError('igdb', 'Champ invalide : platforms (attendu : array ou null)');
    }
}

/**
 * Valide la structure de réponse d'un film TMDB.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateTmdbMovie(data: unknown): asserts data is TmdbMovieRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('tmdb', 'La réponse n\'est pas un objet');
    }

    const movie = data as Record<string, unknown>;

    if (typeof movie.id !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Champ manquant ou invalide : id (attendu : number)');
    }

    if (!movie.title || typeof movie.title !== 'string') {
        throw new InvalidProviderDataError('tmdb', 'Champ manquant ou invalide : title (attendu : string non vide)');
    }

    // Vérifie que le media_type est 'movie' pour la cohérence
    if (movie.media_type !== 'movie' && movie.media_type !== undefined) {
        throw new InvalidProviderDataError('tmdb', 'media_type invalide (attendu : "movie")');
    }

    if (movie.vote_average !== undefined && movie.vote_average !== null && typeof movie.vote_average !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Champ invalide : vote_average (attendu : number ou null)');
    }
}

/**
 * Valide la structure de réponse d'une série TV TMDB.
 * @throws InvalidProviderDataError si la validation échoue.
 */
export function validateTmdbTv(data: unknown): asserts data is TmdbTvRaw {
    if (!data || typeof data !== 'object') {
        throw new InvalidProviderDataError('tmdb', 'La réponse n\'est pas un objet');
    }

    const tv = data as Record<string, unknown>;

    if (typeof tv.id !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Champ manquant ou invalide : id (attendu : number)');
    }

    if (!tv.name || typeof tv.name !== 'string') {
        throw new InvalidProviderDataError('tmdb', 'Champ manquant ou invalide : name (attendu : string non vide)');
    }

    // Vérifie que le media_type est 'tv' pour la cohérence
    if (tv.media_type !== 'tv' && tv.media_type !== undefined) {
        throw new InvalidProviderDataError('tmdb', 'media_type invalide (attendu : "tv")');
    }

    if (tv.vote_average !== undefined && tv.vote_average !== null && typeof tv.vote_average !== 'number') {
        throw new InvalidProviderDataError('tmdb', 'Champ invalide : vote_average (attendu : number ou null)');
    }
}

/**
 * Valide la structure de réponse d'un livre Google Books.
 * @throws InvalidProviderDataError si la validation échoue.
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
