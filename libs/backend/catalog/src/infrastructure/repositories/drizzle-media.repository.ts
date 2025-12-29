import { eq, ilike, and, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IMediaRepository, MediaSearchFilters } from '../../application/ports/media.repository.interface';
import { MediaType, Media, Game, Movie, TV, Book } from '../../domain/entities/media.entity';
import { Rating } from '../../domain/value-objects/rating.vo';
import { CoverUrl } from '../../domain/value-objects/cover-url.vo';
import { ReleaseYear } from '../../domain/value-objects/release-year.vo';
import * as schema from '../db/media.schema';

// Helper to safely create VOs from DB data
const createRating = (val: number | null): Rating | null => {
    if (val === null) return null;
    try { return new Rating(val); } catch { return null; }
};

const createCoverUrl = (val: string | null): CoverUrl | null => {
    if (!val) return null;
    try { return new CoverUrl(val); } catch { return null; }
};

const createReleaseYear = (date: Date | null): ReleaseYear | null => {
    if (!date) return null;
    try { return new ReleaseYear(date.getFullYear()); } catch { return null; }
};

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
            // Map ReleaseYear VO to Date (approximate)
            const releaseDate = media.releaseYear ? new Date(media.releaseYear.getValue(), 0, 1) : null;

            // 1. Insert/Update medias table
            await tx
                .insert(schema.medias)
                .values({
                    id: media.id,
                    title: media.title,
                    type: media.type,
                    releaseDate: releaseDate,
                    globalRating: media.rating?.getValue() ?? null,
                    createdAt: new Date(), // Using now for createdAt, assuming new entity
                    providerMetadata: {}, // Assuming metadata is handled elsewhere or stripped for now if not in Entity root
                })
                .onConflictDoUpdate({
                    target: schema.medias.id,
                    set: {
                        title: media.title,
                        releaseDate: releaseDate,
                        globalRating: media.rating?.getValue() ?? null,
                    },
                });

            // 2. Insert/Update into subtype table
            switch (media.type) {
                case MediaType.GAME: {
                    if (media instanceof Game) {
                        await tx.insert(schema.games).values({
                            id: media.id,
                            platform: media.platform,
                            developer: media.developer,
                            timeToBeat: media.timeToBeat,
                        }).onConflictDoUpdate({
                            target: schema.games.id,
                            set: {
                                platform: media.platform,
                                developer: media.developer,
                                timeToBeat: media.timeToBeat,
                            }
                        });
                    }
                    break;
                }
                case MediaType.MOVIE: {
                    if (media instanceof Movie) {
                        await tx.insert(schema.movies).values({
                            id: media.id,
                            director: media.director,
                            durationMinutes: media.durationMinutes,
                        }).onConflictDoUpdate({
                            target: schema.movies.id,
                            set: {
                                director: media.director,
                                durationMinutes: media.durationMinutes,
                            }
                        });
                    }
                    break;
                }
                case MediaType.TV: {
                    if (media instanceof TV) {
                        await tx.insert(schema.tv).values({
                            id: media.id,
                            creator: media.creator,
                            episodesCount: media.episodesCount,
                            seasonsCount: media.seasonsCount,
                        }).onConflictDoUpdate({
                            target: schema.tv.id,
                            set: {
                                creator: media.creator,
                                episodesCount: media.episodesCount,
                                seasonsCount: media.seasonsCount,
                            }
                        });
                    }
                    break;
                }
                case MediaType.BOOK: {
                    if (media instanceof Book) {
                        await tx.insert(schema.books).values({
                            id: media.id,
                            author: media.author,
                            pages: media.pages,
                        }).onConflictDoUpdate({
                            target: schema.books.id,
                            set: {
                                author: media.author,
                                pages: media.pages,
                            }
                        });
                    }
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
        const id = row.medias.id;
        const title = row.medias.title;
        // const description = row.medias.description; // DB Schema needs description?
        const description = null; // Add to schema later if needed
        const providerId = 'unknown'; // Need to map this from metadata or schema
        const coverUrl = createCoverUrl(null); // DB doesn't seem to have cover_url on root media yet? Schema check needed.
        const rating = createRating(row.medias.globalRating);
        const releaseYear = createReleaseYear(row.medias.releaseDate);

        switch (row.medias.type) {
            case MediaType.GAME:
                if (!row.games) throw new Error(`Data integrity error: Media ${id} is TYPE GAME but has no games record.`);
                return new Game(
                    id, title, description, coverUrl, rating, releaseYear, providerId,
                    row.games.platform as string[],
                    row.games.developer,
                    row.games.timeToBeat
                );

            case MediaType.MOVIE:
                if (!row.movies) throw new Error(`Data integrity error: Media ${id} is TYPE MOVIE but has no movies record.`);
                return new Movie(
                    id, title, description, coverUrl, rating, releaseYear, providerId,
                    row.movies.director,
                    row.movies.durationMinutes
                );

            case MediaType.TV:
                if (!row.tv) throw new Error(`Data integrity error: Media ${id} is TYPE TV but has no tv record.`);
                return new TV(
                    id, title, description, coverUrl, rating, releaseYear, providerId,
                    row.tv.creator,
                    row.tv.episodesCount,
                    row.tv.seasonsCount
                );

            case MediaType.BOOK:
                if (!row.books) throw new Error(`Data integrity error: Media ${id} is TYPE BOOK but has no books record.`);
                return new Book(
                    id, title, description, coverUrl, rating, releaseYear, providerId,
                    row.books.author,
                    row.books.pages
                );

            default:
                throw new Error(`Unknown media type: ${row.medias.type}`);
        }
    }
}
