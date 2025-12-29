import {
    medias,
    games,
    movies,
    tv,
    books,
    mediaTypeEnum,
} from '../db/media.schema';
import type {
    IgdbGameRaw,
    TmdbMovieRaw,
    TmdbTvRaw,
    GoogleBookRaw,
    ProviderMetadata,
} from '../../domain/types/provider-responses';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/media.schema';

// Types for Drizzle schema
type MediaType = 'GAME' | 'MOVIE' | 'TV' | 'BOOK';

// --- Pure Mappers ---

export function mapGameToEntity(raw: IgdbGameRaw): {
    media: typeof medias.$inferInsert;
    game: typeof games.$inferInsert;
} {
    const id = uuidv4();
    const coverUrl = raw.cover?.url?.replace('//', 'https://');
    const releaseDate = raw.first_release_date
        ? new Date(raw.first_release_date * 1000)
        : null;

    return {
        media: {
            id,
            type: 'GAME',
            title: raw.name,
            releaseDate,
            globalRating: raw.total_rating ? raw.total_rating / 10 : null, // IGDB is 0-100, we want 0-10
            providerMetadata: {
                source: 'IGDB',
                igdbId: raw.id,
                gameRaw: raw,
            },
            createdAt: new Date(),
        },
        game: {
            id,
            platform: raw.platforms?.map((p) => p.name) || [],
            developer: null, // IGDB developer info requires separate fetch usually
            timeToBeat: null,
        },
    };
}

export function mapMovieToEntity(raw: TmdbMovieRaw): {
    media: typeof medias.$inferInsert;
    movie: typeof movies.$inferInsert;
} {
    const id = uuidv4();
    const posterUrl = raw.poster_path
        ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
        : null;

    return {
        media: {
            id,
            type: 'MOVIE',
            title: raw.title,
            releaseDate: raw.release_date ? new Date(raw.release_date) : null,
            globalRating: raw.vote_average, // TMDB is 0-10
            providerMetadata: {
                source: 'TMDB',
                tmdbId: raw.id,
                mediaType: 'movie',
                movieRaw: raw,
            },
            createdAt: new Date(),
        },
        movie: {
            id,
            director: null, // Director requires credits fetch
            durationMinutes: raw.runtime || null,
        },
    };
}

export function mapTvToEntity(raw: TmdbTvRaw): {
    media: typeof medias.$inferInsert;
    tv: typeof tv.$inferInsert;
} {
    const id = uuidv4();
    const posterUrl = raw.poster_path
        ? `https://image.tmdb.org/t/p/w500${raw.poster_path}`
        : null;

    return {
        media: {
            id,
            type: 'TV',
            title: raw.name,
            releaseDate: raw.first_air_date ? new Date(raw.first_air_date) : null,
            globalRating: raw.vote_average,
            providerMetadata: {
                source: 'TMDB',
                tmdbId: raw.id,
                mediaType: 'tv',
                tvRaw: raw,
            },
            createdAt: new Date(),
        },
        tv: {
            id,
            creator: raw.created_by?.[0]?.name || null,
            episodesCount: raw.number_of_episodes || null,
            seasonsCount: raw.number_of_seasons || null,
        },
    };
}

export function mapBookToEntity(raw: GoogleBookRaw): {
    media: typeof medias.$inferInsert;
    book: typeof books.$inferInsert;
} {
    const id = uuidv4();
    const info = raw.volumeInfo;
    const publishedDate = info.publishedDate ? new Date(info.publishedDate) : null;

    return {
        media: {
            id,
            type: 'BOOK',
            title: info.title,
            releaseDate: publishedDate,
            globalRating: null, // Google Books doesn't always provide simple rating
            providerMetadata: {
                source: 'GOOGLE_BOOKS',
                googleId: raw.id,
                bookRaw: raw,
            },
            createdAt: new Date(),
        },
        book: {
            id,
            author: info.authors?.[0] || 'Unknown Author',
            pages: info.pageCount || null,
        },
    };
}

// --- Import Transaction ---

export async function processMediaImport(
    raw: unknown,
    type: MediaType,
    db: NodePgDatabase<typeof schema>
): Promise<void> {
    await db.transaction(async (tx) => {
        let mediaData: typeof medias.$inferInsert;
        let subTable: any;
        let subData: any;

        try {
            switch (type) {
                case 'GAME': {
                    const mapped = mapGameToEntity(raw as IgdbGameRaw);
                    mediaData = mapped.media;
                    subTable = games;
                    subData = mapped.game;
                    break;
                }
                case 'MOVIE': {
                    const mapped = mapMovieToEntity(raw as TmdbMovieRaw);
                    mediaData = mapped.media;
                    subTable = movies;
                    subData = mapped.movie;
                    break;
                }
                case 'TV': {
                    const mapped = mapTvToEntity(raw as TmdbTvRaw);
                    mediaData = mapped.media;
                    subTable = tv;
                    subData = mapped.tv;
                    break;
                }
                case 'BOOK': {
                    const mapped = mapBookToEntity(raw as GoogleBookRaw);
                    mediaData = mapped.media;
                    subTable = books;
                    subData = mapped.book;
                    break;
                }
                default:
                    throw new Error(`Unsupported media type: ${type}`);
            }

            // 1. Check for duplicates using Provider ID
            // Ideally we should use a unique constraint on providerMetadata->>'id' but json queries are heavy
            // For now, we rely on the insertion.
            // Since we generate a new UUID every time this script runs, we don't have true idempotency on upsert by KEY yet
            // UNLESS we query first.

            // To make it truly idempotent, subsequent steps (not implemented here) would involve checking existing entries by provider ID.
            // For this implementation, we proceed with insertion.

            await tx.insert(medias).values(mediaData);
            await tx.insert(subTable).values(subData);

            console.log(`✅ [Import Logic] Persisted ${type}: ${mediaData.title}`);

        } catch (error) {
            console.error(`❌ [Import Logic] Failed to map/insert ${type}`, error);
            throw error;
        }
    });
}
