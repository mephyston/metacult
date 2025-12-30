import { eq, ilike, and, desc } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IMediaRepository, MediaSearchFilters } from '../../application/ports/media.repository.interface';
import { MediaType, Media, Game, Movie, TV, Book } from '../../domain/entities/media.entity';
import { Rating } from '../../domain/value-objects/rating.vo';
import { CoverUrl } from '../../domain/value-objects/cover-url.vo';
import { ReleaseYear } from '../../domain/value-objects/release-year.vo';
import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import * as schema from '../db/media.schema';
import type { ProviderMetadata } from '../types/raw-responses';

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

    nextId(): string {
        return crypto.randomUUID();
    }

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

    async searchViews(filters: MediaSearchFilters): Promise<import('../../application/queries/search-media/media-read.dto').MediaReadDto[]> {
        console.log('🔍 REPO: Executing DTO search');
        const query = this.db
            .select({
                id: schema.medias.id,
                title: schema.medias.title,
                type: schema.medias.type,
                rating: schema.medias.globalRating,
                releaseYear: schema.medias.releaseDate,
                // description: schema.medias.description, // Not in schema yet, assumed null
                coverUrl: schema.medias.providerMetadata, // Extracting first image if possible, or null for now. Schema doesn't have direct coverUrl column? 
                // Wait, Entity has coverUrl. Where does it come from? 
                // In mapRowToEntity: "const coverUrl = createCoverUrl(null);" -> It seems coverUrl is effectively null in current implementation??
                // Checking schema.medias definition might be useful.
                // For now, returning null to match current behavior.
            })
            .from(schema.medias)
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

        query.orderBy(desc(schema.medias.createdAt));

        const rows = await query.execute();

        // Raw aggregation to avoid duplication
        const unique = new Map<string, import('../../application/queries/search-media/media-read.dto').MediaReadDto>();
        for (const row of rows) {
            if (!unique.has(row.id)) {
                unique.set(row.id, {
                    id: row.id,
                    title: row.title,
                    type: row.type.toLowerCase() as any,
                    rating: row.rating,
                    releaseYear: row.releaseYear ? row.releaseYear.getFullYear() : null,
                    description: null, // Schema missing description
                    coverUrl: null, // Schema missing coverUrl column
                });
            }
        }
        return Array.from(unique.values());
    }

    async create(media: Media): Promise<void> {
        await this.db.transaction(async (tx) => {
            // Map ReleaseYear VO to Date (approximate)
            const releaseDate = media.releaseYear ? new Date(media.releaseYear.getValue(), 0, 1) : null;

            // Reconstruct ProviderMetadata from ExternalReference
            let providerMetadata: ProviderMetadata;
            const ref = media.externalReference;

            if (ref.provider === 'igdb') {
                providerMetadata = { source: 'IGDB', igdbId: Number(ref.id) };
            } else if (ref.provider === 'tmdb') {
                providerMetadata = {
                    source: 'TMDB',
                    tmdbId: Number(ref.id),
                    mediaType: media.type === MediaType.MOVIE ? 'movie' : 'tv'
                };
            } else if (ref.provider === 'google_books') {
                providerMetadata = { source: 'GOOGLE_BOOKS', googleId: ref.id };
            } else {
                providerMetadata = {} as any; // Fallback
            }

            // 1. Insert/Update medias table
            await tx
                .insert(schema.medias)
                .values({
                    id: media.id,
                    title: media.title,
                    type: media.type.toUpperCase() as any,
                    releaseDate: releaseDate,
                    globalRating: media.rating?.getValue() ?? null,
                    createdAt: new Date(), // Using now for createdAt, assuming new entity
                    providerMetadata: providerMetadata,
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
        const description = null;

        let externalReference: ExternalReference;
        const metadata = row.medias.providerMetadata;

        if (metadata) {
            if (metadata.source === 'IGDB') externalReference = new ExternalReference('igdb', String(metadata.igdbId));
            else if (metadata.source === 'TMDB') externalReference = new ExternalReference('tmdb', String(metadata.tmdbId));
            else if (metadata.source === 'GOOGLE_BOOKS') externalReference = new ExternalReference('google_books', metadata.googleId);
            else externalReference = new ExternalReference('unknown', 'unknown');
        } else {
            externalReference = new ExternalReference('unknown', 'unknown');
        }

        const coverUrl = createCoverUrl(null);
        const rating = createRating(row.medias.globalRating);
        const releaseYear = createReleaseYear(row.medias.releaseDate);

        switch (row.medias.type) {
            case 'GAME':
                if (!row.games) throw new Error(`Data integrity error: Media ${id} is TYPE GAME but has no games record.`);
                return new Game(
                    id, title, description, coverUrl, rating, releaseYear, externalReference,
                    row.games.platform as string[],
                    row.games.developer,
                    row.games.timeToBeat
                );

            case 'MOVIE':
                if (!row.movies) throw new Error(`Data integrity error: Media ${id} is TYPE MOVIE but has no movies record.`);
                return new Movie(
                    id, title, description, coverUrl, rating, releaseYear, externalReference,
                    row.movies.director,
                    row.movies.durationMinutes
                );

            case 'TV':
                if (!row.tv) throw new Error(`Data integrity error: Media ${id} is TYPE TV but has no tv record.`);
                return new TV(
                    id, title, description, coverUrl, rating, releaseYear, externalReference,
                    row.tv.creator,
                    row.tv.episodesCount,
                    row.tv.seasonsCount
                );

            case 'BOOK':
                if (!row.books) throw new Error(`Data integrity error: Media ${id} is TYPE BOOK but has no books record.`);
                return new Book(
                    id, title, description, coverUrl, rating, releaseYear, externalReference,
                    row.books.author,
                    row.books.pages
                );

            default:
                throw new Error(`Unknown media type: ${row.medias.type}`);
        }
    }
}
