import type {
    IgdbGameRaw,
    TmdbMovieRaw,
    TmdbTvRaw,
    GoogleBookRaw,
} from '../types/raw-responses';
import { v4 as uuidv4 } from 'uuid';

import { Rating } from '../../domain/value-objects/rating.vo';
import { CoverUrl } from '../../domain/value-objects/cover-url.vo';
import { ReleaseYear } from '../../domain/value-objects/release-year.vo';
import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import { Game, Movie, TV, Book } from '../../domain/entities/media.entity';

// Helper to safely create VOs
const createRating = (val: number | undefined | null): Rating | null => {
    if (val === undefined || val === null) return null;
    try { return new Rating(val); } catch { return null; }
};

const createCoverUrl = (val: string | undefined | null): CoverUrl | null => {
    if (!val) return null;
    // Fix protocol: Replace http:// or // with https://
    let secureUrl = val;
    if (val.startsWith('http://')) {
        secureUrl = val.replace('http://', 'https://');
    } else if (val.startsWith('//')) {
        secureUrl = `https:${val}`;
    }

    try { return new CoverUrl(secureUrl); } catch { return null; }
};

const createReleaseYear = (dateText: string | number | undefined | null): ReleaseYear | null => {
    if (!dateText) return null;
    const year = typeof dateText === 'string' ? new Date(dateText).getFullYear() : new Date(dateText * 1000).getFullYear();
    try { return new ReleaseYear(year); } catch { return null; }
};
// Helper for SEO Slugs
const slugify = (text: string): string => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w-]+/g, '') // Remove all non-word chars
        .replace(/-+/g, '-');  // Replace multiple - with single -
};

// ... existing helpers ...

/**
 * Mappers : Transforment les réponses brutes des APIs externes en Entités du Domaine.
 * Ils acceptent un ID injecté, permettant au Repository de gérer la génération d'identité.
 */

/**
 * Mappe un jeu IGDB vers l'entité Game.
 * @param {IgdbGameRaw} raw - Données brutes IGDB.
 * @param {string} id - ID interne pré-généré.
 */
export function mapGameToEntity(raw: IgdbGameRaw, id: string): Game {
    const rating = raw.total_rating ? raw.total_rating / 10 : null;
    return new Game(
        id,
        raw.name,
        slugify(raw.name),
        raw.summary || null,
        createCoverUrl(raw.cover?.url),
        createRating(rating),
        createReleaseYear(raw.first_release_date),
        new ExternalReference('igdb', String(raw.id)),
        raw.platforms?.map((p) => p.name) || [],
        null, // Developer not fetched
        null // TimeToBeat not fetched
    );
}

/**
 * Mappe un film TMDB vers l'entité Movie.
 * @param {TmdbMovieRaw} raw - Données brutes TMDB.
 * @param {string} id - ID interne pré-généré.
 */
export function mapMovieToEntity(raw: TmdbMovieRaw, id: string): Movie {
    const posterUrl = raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null;
    return new Movie(
        id,
        raw.title,
        slugify(raw.title),
        raw.overview || null,
        createCoverUrl(posterUrl),
        createRating(raw.vote_average),
        createReleaseYear(raw.release_date),
        new ExternalReference('tmdb', String(raw.id)),
        null, // Director
        raw.runtime || null
    );
}

/**
 * Mappe une série TMDB vers l'entité TV.
 * @param {TmdbTvRaw} raw - Données brutes TMDB.
 * @param {string} id - ID interne pré-généré.
 */
export function mapTvToEntity(raw: TmdbTvRaw, id: string): TV {
    const posterUrl = raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null;
    return new TV(
        id,
        raw.name,
        slugify(raw.name),
        raw.overview || null,
        createCoverUrl(posterUrl),
        createRating(raw.vote_average),
        createReleaseYear(raw.first_air_date),
        new ExternalReference('tmdb', String(raw.id)),
        raw.created_by?.[0]?.name || null,
        raw.number_of_episodes || null,
        raw.number_of_seasons || null
    );
}

/**
 * Mappe un livre Google Books vers l'entité Book.
 * @param {GoogleBookRaw} raw - Données brutes Google Books.
 * @param {string} id - ID interne pré-généré.
 */
export function mapBookToEntity(raw: GoogleBookRaw, id: string): Book {
    const info = raw.volumeInfo;
    return new Book(
        id,
        info.title,
        slugify(info.title),
        info.description || null,
        createCoverUrl(info.imageLinks?.thumbnail),
        null, // No rating
        createReleaseYear(info.publishedDate),
        new ExternalReference('google_books', String(raw.id)),
        info.authors?.[0] || 'Unknown',
        info.pageCount || null
    );
}

// processMediaImport removed. Use ImportMediaHandler instead.
