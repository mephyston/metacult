import type {
  IgdbGameRaw,
  TmdbMovieRaw,
  TmdbTvRaw,
  GoogleBookRaw,
} from '../types/raw-responses';
import { InvalidProviderDataError } from '../../domain/errors/catalog.errors';
import { v4 as uuidv4 } from 'uuid';

import { Rating } from '../../domain/value-objects/rating.vo';
import { CoverUrl } from '../../domain/value-objects/cover-url.vo';
import { ReleaseYear } from '../../domain/value-objects/release-year.vo';
import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import { Game, Movie, TV, Book } from '../../domain/entities/media.entity';

// Helper to safely create VOs
const createRating = (val: number | undefined | null): Rating | null => {
  if (val === undefined || val === null) return null;
  try {
    return new Rating(val);
  } catch {
    return null;
  }
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

  try {
    return new CoverUrl(secureUrl);
  } catch {
    return null;
  }
};

const createReleaseYear = (
  dateText: string | number | undefined | null,
): ReleaseYear | null => {
  if (!dateText) return null;
  const year =
    typeof dateText === 'string'
      ? new Date(dateText).getFullYear()
      : new Date(dateText * 1000).getFullYear();
  try {
    return new ReleaseYear(year);
  } catch {
    return null;
  }
};
// Helper for SEO Slugs
const slugify = (text: string | null | undefined): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/-+/g, '-'); // Replace multiple - with single -
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
  if (!raw.name) {
    throw new InvalidProviderDataError(
      'IGDB',
      `Game missing name (ID: ${raw.id})`,
    );
  }
  const rating = raw.total_rating ? raw.total_rating / 10 : null;
  return new Game({
    id,
    title: raw.name,
    slug: slugify(`${raw.name}-igdb-${raw.id}`),
    description: raw.summary || null,
    // IGDB returns t_thumb (90x90) by default. Upgrade to t_cover_big (264x374).
    coverUrl: createCoverUrl(raw.cover?.url?.replace('t_thumb', 't_cover_big')),
    rating: createRating(rating),
    releaseYear: createReleaseYear(raw.first_release_date),
    externalReference: new ExternalReference('igdb', String(raw.id)),
    platform: raw.platforms?.map((p) => p.name) || [],
    developer: null, // Developer not fetched
    timeToBeat: null, // TimeToBeat not fetched
    eloScore: 1500,
    matchCount: 0,
  });
}

/**
 * Mappe un film TMDB vers l'entité Movie.
 * @param {TmdbMovieRaw} raw - Données brutes TMDB.
 * @param {string} id - ID interne pré-généré.
 */
export function mapMovieToEntity(raw: TmdbMovieRaw, id: string): Movie {
  if (!raw.title) {
    throw new InvalidProviderDataError(
      'TMDB',
      `Movie missing title (ID: ${raw.id})`,
    );
  }
  const posterUrl = raw.poster_path
    ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
    : null;
  return new Movie({
    id,
    title: raw.title,
    slug: slugify(`${raw.title}-tmdb-${raw.id}`),
    description: raw.overview || null,
    coverUrl: createCoverUrl(posterUrl),
    rating: createRating(raw.vote_average),
    releaseYear: createReleaseYear(raw.release_date),
    externalReference: new ExternalReference('tmdb', String(raw.id)),
    director: null, // Director
    durationMinutes: raw.runtime || null,
    eloScore: 1500,
    matchCount: 0,
  });
}

/**
 * Mappe une série TMDB vers l'entité TV.
 * @param {TmdbTvRaw} raw - Données brutes TMDB.
 * @param {string} id - ID interne pré-généré.
 */
export function mapTvToEntity(raw: TmdbTvRaw, id: string): TV {
  if (!raw.name) {
    throw new InvalidProviderDataError(
      'TMDB',
      `TV missing name (ID: ${raw.id})`,
    );
  }
  const posterUrl = raw.poster_path
    ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
    : null;
  return new TV({
    id,
    title: raw.name,
    slug: slugify(`${raw.name}-tmdb-${raw.id}`),
    description: raw.overview || null,
    coverUrl: createCoverUrl(posterUrl),
    rating: createRating(raw.vote_average),
    releaseYear: createReleaseYear(raw.first_air_date),
    externalReference: new ExternalReference('tmdb', String(raw.id)),
    creator: raw.created_by?.[0]?.name || null,
    episodesCount: raw.number_of_episodes || null,
    seasonsCount: raw.number_of_seasons || null,
    eloScore: 1500,
    matchCount: 0,
  });
}

/**
 * Mappe un livre Google Books vers l'entité Book.
 * @param {GoogleBookRaw} raw - Données brutes Google Books.
 * @param {string} id - ID interne pré-généré.
 */
export function mapBookToEntity(raw: GoogleBookRaw, id: string): Book {
  const info = raw.volumeInfo;
  if (!info.title) {
    throw new InvalidProviderDataError(
      'GoogleBooks',
      `Book missing title (ID: ${raw.id})`,
    );
  }
  return new Book({
    id,
    title: info.title,
    slug: slugify(`${info.title}-gb-${raw.id}`),
    description: info.description || null,
    coverUrl: createCoverUrl(info.imageLinks?.thumbnail),
    rating: null, // No rating
    releaseYear: createReleaseYear(info.publishedDate),
    externalReference: new ExternalReference('google_books', String(raw.id)),
    author: info.authors?.[0] || 'Unknown',
    pages: info.pageCount || null,
    eloScore: 1500,
    matchCount: 0,
  });
}

// processMediaImport removed. Use ImportMediaHandler instead.
