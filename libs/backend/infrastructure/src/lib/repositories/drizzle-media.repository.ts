import { eq, ilike, and, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IMediaRepository, MediaSearchFilters } from '@metacult/backend/domain';
import { MediaType } from '@metacult/backend/domain';
import type { Media, Game, Movie, TV, Book } from '@metacult/backend/domain';
import * as schema from '../db/schema';

// Helper type for the DB instance
type Db = NodePgDatabase<typeof schema>;

export class DrizzleMediaRepository implements IMediaRepository {
    constructor(private readonly db: Db) { }

    async findById(id: string): Promise<Media | null> {
        // Polymorphic fetch using left joins to hydrate specific fields
        const rows = await this.db
            .select()
            .from(schema.medias)
            .leftJoin(schema.games, eq(schema.medias.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.medias.id, schema.movies.id))
            .leftJoin(schema.tv, eq(schema.medias.id, schema.tv.id))
            .leftJoin(schema.books, eq(schema.medias.id, schema.books.id))
            .where(eq(schema.medias.id, id))
            .limit(1);

        if (rows.length === 0 || !rows[0]) return null;

        return this.mapRowToEntity(rows[0]);
    }

    async search(filters: MediaSearchFilters): Promise<Media[]> {
        console.log('🔍 REPO: Executing search');
        const query = this.db
            .select()
            .from(schema.medias)
            .leftJoin(schema.games, eq(schema.medias.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.medias.id, schema.movies.id))
            .leftJoin(schema.tv, eq(schema.medias.id, schema.tv.id))
            .leftJoin(schema.books, eq(schema.medias.id, schema.books.id))
            // Join tags if filtering by tag
            .leftJoin(schema.mediasToTags, eq(schema.medias.id, schema.mediasToTags.mediaId))
            .leftJoin(schema.tags, eq(schema.mediasToTags.tagId, schema.tags.id));

        const conditions = [];

        if (filters.type) {
            conditions.push(eq(schema.medias.type, filters.type as any));
        }

        if (filters.search) {
            conditions.push(ilike(schema.medias.title, `%${filters.search}%`));
        }

        if (filters.tag) {
            conditions.push(eq(schema.tags.slug, filters.tag));
        }

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        // Order by latest
        query.orderBy(desc(schema.medias.createdAt));

        const rows = await query.execute();

        // Deduplicate rows in memory (because joined tags create duplicates)
        const uniqueMediasMap = new Map<string, Media>();
        for (const row of rows) {
            if (!uniqueMediasMap.has(row.medias.id)) {
                uniqueMediasMap.set(row.medias.id, this.mapRowToEntity(row));
            }
        }

        return Array.from(uniqueMediasMap.values());
    }

    async create(media: Media): Promise<void> {
        await this.db.transaction(async (tx) => {
            // 1. Insert/Update medias table
            await tx
                .insert(schema.medias)
                .values({
                    id: media.id,
                    title: media.title,
                    type: media.type,
                    releaseDate: media.releaseDate,
                    globalRating: media.globalRating,
                    createdAt: media.createdAt,
                    providerMetadata: media.providerMetadata,
                })
                .onConflictDoUpdate({
                    target: schema.medias.id,
                    set: {
                        title: media.title,
                        releaseDate: media.releaseDate,
                        globalRating: media.globalRating,
                    },
                });

            // 2. Insert/Update into subtype table
            switch (media.type) {
                case MediaType.GAME: {
                    const game = media as Game;
                    await tx.insert(schema.games).values({
                        id: media.id,
                        platform: game.platform,
                        developer: game.developer,
                        timeToBeat: game.timeToBeat,
                    }).onConflictDoUpdate({
                        target: schema.games.id,
                        set: {
                            platform: game.platform,
                            developer: game.developer,
                            timeToBeat: game.timeToBeat,
                        }
                    });
                    break;
                }
                case MediaType.MOVIE: {
                    const movie = media as Movie;
                    await tx.insert(schema.movies).values({
                        id: media.id,
                        director: movie.director,
                        durationMinutes: movie.durationMinutes,
                    }).onConflictDoUpdate({
                        target: schema.movies.id,
                        set: {
                            director: movie.director,
                            durationMinutes: movie.durationMinutes,
                        }
                    });
                    break;
                }
                case MediaType.TV: {
                    const tvShow = media as TV;
                    await tx.insert(schema.tv).values({
                        id: media.id,
                        creator: tvShow.creator,
                        episodesCount: tvShow.episodesCount,
                        seasonsCount: tvShow.seasonsCount,
                    }).onConflictDoUpdate({
                        target: schema.tv.id,
                        set: {
                            creator: tvShow.creator,
                            episodesCount: tvShow.episodesCount,
                            seasonsCount: tvShow.seasonsCount,
                        }
                    });
                    break;
                }
                case MediaType.BOOK: {
                    const book = media as Book;
                    await tx.insert(schema.books).values({
                        id: media.id,
                        author: book.author,
                        pages: book.pages,
                    }).onConflictDoUpdate({
                        target: schema.books.id,
                        set: {
                            author: book.author,
                            pages: book.pages,
                        }
                    });
                    break;
                }
            }
        });
    }

    private mapRowToEntity(row: {
        medias: typeof schema.medias.$inferSelect;
        games: typeof schema.games.$inferSelect | null;
        movies: typeof schema.movies.$inferSelect | null;
        tv: typeof schema.tv.$inferSelect | null;
        books: typeof schema.books.$inferSelect | null;
    }): Media {
        const baseMedia = {
            id: row.medias.id,
            title: row.medias.title,
            type: row.medias.type as MediaType,
            releaseDate: row.medias.releaseDate,
            globalRating: row.medias.globalRating,
            createdAt: row.medias.createdAt,
        };

        switch (row.medias.type) {
            case MediaType.GAME:
                if (!row.games) throw new Error(`Data integrity error: Media ${baseMedia.id} is TYPE GAME but has no games record.`);
                return {
                    ...baseMedia,
                    type: MediaType.GAME,
                    platform: row.games.platform as string[],
                    developer: row.games.developer,
                    timeToBeat: row.games.timeToBeat,
                } as Game;

            case MediaType.MOVIE:
                if (!row.movies) throw new Error(`Data integrity error: Media ${baseMedia.id} is TYPE MOVIE but has no movies record.`);
                return {
                    ...baseMedia,
                    type: MediaType.MOVIE,
                    director: row.movies.director,
                    durationMinutes: row.movies.durationMinutes,
                } as Movie;

            case MediaType.TV:
                if (!row.tv) throw new Error(`Data integrity error: Media ${baseMedia.id} is TYPE TV but has no tv record.`);
                return {
                    ...baseMedia,
                    type: MediaType.TV,
                    creator: row.tv.creator,
                    episodesCount: row.tv.episodesCount,
                    seasonsCount: row.tv.seasonsCount
                } as TV;

            case MediaType.BOOK:
                if (!row.books) throw new Error(`Data integrity error: Media ${baseMedia.id} is TYPE BOOK but has no books record.`);
                return {
                    ...baseMedia,
                    type: MediaType.BOOK,
                    author: row.books.author,
                    pages: row.books.pages
                } as Book;

            default:
                return baseMedia as Media;
        }
    }
}
