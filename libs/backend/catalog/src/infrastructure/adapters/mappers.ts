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
    try { return new CoverUrl(val.replace('//', 'https://')); } catch { return null; }
};

const createReleaseYear = (dateText: string | number | undefined | null): ReleaseYear | null => {
    if (!dateText) return null;
    const year = typeof dateText === 'string' ? new Date(dateText).getFullYear() : new Date(dateText * 1000).getFullYear();
    try { return new ReleaseYear(year); } catch { return null; }
};

export function mapGameToEntity(raw: IgdbGameRaw): Game {
    const rating = raw.total_rating ? raw.total_rating / 10 : null;
    return new Game(
        uuidv4(),
        raw.name,
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

export function mapMovieToEntity(raw: TmdbMovieRaw): Movie {
    const posterUrl = raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null;
    return new Movie(
        uuidv4(),
        raw.title,
        raw.overview || null,
        createCoverUrl(posterUrl),
        createRating(raw.vote_average),
        createReleaseYear(raw.release_date),
        new ExternalReference('tmdb', String(raw.id)),
        null, // Director
        raw.runtime || null
    );
}

export function mapTvToEntity(raw: TmdbTvRaw): TV {
    const posterUrl = raw.poster_path ? `https://image.tmdb.org/t/p/w500${raw.poster_path}` : null;
    return new TV(
        uuidv4(),
        raw.name,
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

export function mapBookToEntity(raw: GoogleBookRaw): Book {
    const info = raw.volumeInfo;
    return new Book(
        uuidv4(),
        info.title,
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
