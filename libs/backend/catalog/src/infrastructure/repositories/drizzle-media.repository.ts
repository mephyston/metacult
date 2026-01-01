import { eq, ilike, and, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IMediaRepository, MediaSearchFilters } from '../../application/ports/media.repository.interface';
import { MediaType, Media, Game, Movie, TV, Book } from '../../domain/entities/media.entity';
import { Rating } from '../../domain/value-objects/rating.vo';
import { CoverUrl } from '../../domain/value-objects/cover-url.vo';
import { ReleaseYear } from '../../domain/value-objects/release-year.vo';
import { ExternalReference } from '../../domain/value-objects/external-reference.vo';
import * as schema from '../db/media.schema';
import type { ProviderMetadata } from '../types/raw-responses';
import { ProviderMetadataMapper } from '../mappers/provider-metadata.mapper';
import type { MediaReadDto } from '../../application/queries/search-media/media-read.dto';

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

/**
 * Implémentation Drizzle du port de persistance `IMediaRepository`.
 * Gère le mapping entre les Entités du Domaine et le schéma relationnel SQL.
 */
export class DrizzleMediaRepository implements IMediaRepository {
    constructor(private readonly db: Db) { }

    nextId(): string {
        return crypto.randomUUID();
    }

    async findById(id: string): Promise<Media | null> {
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

    async findBySlug(slug: string): Promise<Media | null> {
        const rows = await this.db
            .select()
            .from(schema.medias)
            .leftJoin(schema.games, eq(schema.medias.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.medias.id, schema.movies.id))
            .leftJoin(schema.tv, eq(schema.medias.id, schema.tv.id))
            .leftJoin(schema.books, eq(schema.medias.id, schema.books.id))
            .where(eq(schema.medias.slug, slug))
            .limit(1);

        if (rows.length === 0 || !rows[0]) return null;

        return this.mapRowToEntity(rows[0]);
    }

    async search(filters: MediaSearchFilters): Promise<Media[]> {
        const query = this.db
            .select()
            .from(schema.medias)
            .leftJoin(schema.games, eq(schema.medias.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.medias.id, schema.movies.id))
            .leftJoin(schema.tv, eq(schema.medias.id, schema.tv.id))
            .leftJoin(schema.books, eq(schema.medias.id, schema.books.id))
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

        const uniqueMediasMap = new Map<string, Media>();
        for (const row of rows) {
            if (!uniqueMediasMap.has(row.medias.id)) {
                uniqueMediasMap.set(row.medias.id, this.mapRowToEntity(row));
            }
        }

        return Array.from(uniqueMediasMap.values());
    }

    async searchViews(filters: MediaSearchFilters): Promise<MediaReadDto[]> {
        const query = this.db
            .select({
                id: schema.medias.id,
                slug: schema.medias.slug,
                title: schema.medias.title,
                type: schema.medias.type,
                rating: schema.medias.globalRating,
                releaseYear: schema.medias.releaseDate,
                providerMetadata: schema.medias.providerMetadata,
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

        const unique = new Map<string, MediaReadDto>();
        for (const row of rows) {
            if (!unique.has(row.id)) {
                let coverUrl: string | null = null;
                const metadata = row.providerMetadata as any;
                if (metadata && metadata.coverUrl) {
                    coverUrl = metadata.coverUrl;
                }

                unique.set(row.id, {
                    id: row.id,
                    slug: row.slug,
                    title: row.title,
                    type: row.type.toLowerCase() as any,
                    rating: row.rating,
                    releaseYear: row.releaseYear ? row.releaseYear.getFullYear() : null,
                    description: null,
                    coverUrl: coverUrl,
                    isImported: true
                });
            }
        }
        return Array.from(unique.values());
    }

    async findMostRecent(limit: number): Promise<MediaReadDto[]> {
        const rows = await this.db.select()
            .from(schema.medias)
            .orderBy(desc(schema.medias.createdAt))
            .limit(limit);

        if (rows.length === 0) return [];

        const mediaIds = rows.map(r => r.id);
        const tagsRows = await this.db.select({
            mediaId: schema.mediasToTags.mediaId,
            tagSlug: schema.tags.slug,
            tagLabel: schema.tags.label
        })
            .from(schema.mediasToTags)
            .innerJoin(schema.tags, eq(schema.mediasToTags.tagId, schema.tags.id))
            .where(sql`${schema.mediasToTags.mediaId} IN ${mediaIds}`);

        const tagsMap = new Map<string, string[]>();
        for (const tagRow of tagsRows) {
            if (!tagsMap.has(tagRow.mediaId)) {
                tagsMap.set(tagRow.mediaId, []);
            }
            tagsMap.get(tagRow.mediaId)?.push(tagRow.tagLabel);
        }

        return rows.map(row => {
            let coverUrl: string | null = null;
            const metadata = row.providerMetadata as any;

            if (metadata) {
                if (metadata.coverUrl) {
                    coverUrl = metadata.coverUrl;
                } else if (metadata.poster_path) {
                    const path = metadata.poster_path.startsWith('/') ? metadata.poster_path : `/${metadata.poster_path}`;
                    coverUrl = `https://image.tmdb.org/t/p/original${path}`;
                } else if (metadata.image_id) {
                    coverUrl = `https://images.igdb.com/igdb/image/upload/t_1080p/${metadata.image_id}.jpg`;
                }
            }

            return {
                id: row.id,
                slug: row.slug,
                title: row.title,
                type: row.type.toLowerCase() as any,
                rating: row.globalRating,
                releaseYear: row.releaseDate ? row.releaseDate.getFullYear() : null,
                coverUrl: coverUrl,
                description: null,
                isImported: true,
                tags: tagsMap.get(row.id) || []
            };
        });
    }

    async findByProviderId(provider: string, externalId: string): Promise<Media | null> {
        let condition;
        if (provider === 'igdb') {
            condition = and(
                eq(sql<string>`${schema.medias.providerMetadata}->>'source'`, 'IGDB'),
                eq(sql<string>`${schema.medias.providerMetadata}->>'igdbId'`, externalId)
            );
        } else if (provider === 'tmdb') {
            condition = and(
                eq(sql<string>`${schema.medias.providerMetadata}->>'source'`, 'TMDB'),
                eq(sql<string>`${schema.medias.providerMetadata}->>'tmdbId'`, externalId)
            );
        } else if (provider === 'google_books') {
            condition = and(
                eq(sql<string>`${schema.medias.providerMetadata}->>'source'`, 'GOOGLE_BOOKS'),
                eq(sql<string>`${schema.medias.providerMetadata}->>'googleId'`, externalId)
            );
        } else {
            return null;
        }

        const rows = await this.db
            .select()
            .from(schema.medias)
            .leftJoin(schema.games, eq(schema.medias.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.medias.id, schema.movies.id))
            .leftJoin(schema.tv, eq(schema.medias.id, schema.tv.id))
            .leftJoin(schema.books, eq(schema.medias.id, schema.books.id))
            .where(condition)
            .limit(1);

        if (rows.length === 0 || !rows[0]) return null;

        return this.mapRowToEntity(rows[0]);
    }

    async create(media: Media): Promise<void> {
        await this.db.transaction(async (tx) => {
            const releaseDate = media.releaseYear ? new Date(media.releaseYear.getValue(), 0, 1) : null;

            let mediaTypeContext: 'movie' | 'tv' | undefined;
            if (media.type === MediaType.MOVIE) mediaTypeContext = 'movie';
            if (media.type === MediaType.TV) mediaTypeContext = 'tv';

            const providerMetadataRaw = ProviderMetadataMapper.toProviderMetadataWithType(
                media.externalReference,
                mediaTypeContext
            );

            if (media.coverUrl) {
                providerMetadataRaw.coverUrl = media.coverUrl.getValue();
            }

            const mediaRow: typeof schema.medias.$inferInsert = {
                id: media.id,
                title: media.title,
                slug: media.slug,
                type: media.type.toUpperCase() as any,
                releaseDate: releaseDate,
                globalRating: media.rating ? media.rating.getValue() : null,
                providerMetadata: providerMetadataRaw,
                createdAt: new Date(),
            };

            await tx
                .insert(schema.medias)
                .values(mediaRow)
                .onConflictDoUpdate({
                    target: schema.medias.id,
                    set: {
                        title: mediaRow.title,
                        slug: mediaRow.slug,
                        releaseDate: mediaRow.releaseDate,
                        globalRating: mediaRow.globalRating,
                        providerMetadata: mediaRow.providerMetadata,
                    },
                });

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
        const slug = row.medias.slug;
        const description = null;

        // Use mapper to convert ProviderMetadata back to ExternalReference
        let externalReference: ExternalReference;
        const metadata = row.medias.providerMetadata;

        if (metadata) {
            try {
                externalReference = ProviderMetadataMapper.toExternalReference(metadata);
            } catch {
                externalReference = new ExternalReference('unknown', 'unknown');
            }
        } else {
            externalReference = new ExternalReference('unknown', 'unknown');
        }

        const coverUrl = createCoverUrl(metadata?.coverUrl || null);
        const rating = createRating(row.medias.globalRating);
        const releaseYear = createReleaseYear(row.medias.releaseDate);

        switch (row.medias.type) {
            case 'GAME':
                if (!row.games) throw new Error(`Data integrity error: Media ${id} is TYPE GAME but has no games record.`);
                return new Game(
                    id, title, slug, description, coverUrl, rating, releaseYear, externalReference,
                    row.games.platform as string[],
                    row.games.developer,
                    row.games.timeToBeat
                );

            case 'MOVIE':
                if (!row.movies) throw new Error(`Data integrity error: Media ${id} is TYPE MOVIE but has no movies record.`);
                return new Movie(
                    id, title, slug, description, coverUrl, rating, releaseYear, externalReference,
                    row.movies.director,
                    row.movies.durationMinutes
                );

            case 'TV':
                if (!row.tv) throw new Error(`Data integrity error: Media ${id} is TYPE TV but has no tv record.`);
                return new TV(
                    id, title, slug, description, coverUrl, rating, releaseYear, externalReference,
                    row.tv.creator,
                    row.tv.episodesCount,
                    row.tv.seasonsCount
                );

            case 'BOOK':
                if (!row.books) throw new Error(`Data integrity error: Media ${id} is TYPE BOOK but has no books record.`);
                return new Book(
                    id, title, slug, description, coverUrl, rating, releaseYear, externalReference,
                    row.books.author,
                    row.books.pages
                );

            default:
                throw new Error(`Unknown media type: ${row.medias.type}`);
        }
    }
}
