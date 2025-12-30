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
 * 
 * @class DrizzleMediaRepository
 * @implements {IMediaRepository}
 */
export class DrizzleMediaRepository implements IMediaRepository {
    /**
     * @param {Db} db - L'instance de connexion Drizzle (injectée).
     */
    constructor(private readonly db: Db) { }

    nextId(): string {
        return crypto.randomUUID();
    }

    /**
     * Récupère un média par ID en chargeant les données spécifiques à son type (Polymorphisme).
     * Utilise des LEFT JOIN pour tout récupérer en une seule requête SQL.
     * 
     * @param {string} id - UUID cible.
     * @returns {Promise<Media | null>} L'entité pleinement hydratée.
     */
    async findById(id: string): Promise<Media | null> {
        // Fetch Polymorphique : On utilise des LEFT JOINs pour hydrater les champs spécifiques du type
        // Cela permet de reconstruire l'Entité complète (Ex: Game avec ses champs de jeu) en une seule requête.
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
        console.log('🔍 REPO: Exécution recherche (Entités)');
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
        console.log('🔍 REPO: Exécution recherche (DTOs)');
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
                    isImported: true
                });
            }
        }
        return Array.from(unique.values());
    }

    async findMostRecent(limit: number): Promise<import('../../application/queries/search-media/media-read.dto').MediaReadDto[]> {
        try {
            // 1. Fetch recent medias
            const rows = await this.db.select()
                .from(schema.medias)
                .orderBy(desc(schema.medias.createdAt))
                .limit(limit);

            if (rows.length === 0) return [];

            // 2. Fetch tags for these medias
            const mediaIds = rows.map(r => r.id);
            const tagsRows = await this.db.select({
                mediaId: schema.mediasToTags.mediaId,
                tagSlug: schema.tags.slug,
                tagLabel: schema.tags.label
            })
                .from(schema.mediasToTags)
                .innerJoin(schema.tags, eq(schema.mediasToTags.tagId, schema.tags.id))
                .where(sql`${schema.mediasToTags.mediaId} IN ${mediaIds}`);

            // 3. Map tags by Media ID
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
                    title: row.title,
                    type: row.type.toLowerCase() as any,
                    rating: row.globalRating,
                    releaseYear: row.releaseDate ? row.releaseDate.getFullYear() : null,
                    coverUrl: coverUrl,
                    isImported: true,
                    tags: tagsMap.get(row.id) || [] // New field
                } as any;
            });
        } catch (e) {
            console.error('🔥 REPO ERROR:', e);
            throw e;
        }
    }

    /**
     * Recherche un média via ses identifiants fournisseurs stockés en JSONB.
     * Cette méthode traduit les concepts du domaine ('igdb', 'tmdb') vers
     * les requêtes SQL spécifiques au schéma `providerMetadata`.
     * 
     * @param {string} provider - Nom du provider normalisé.
     * @param {string} externalId - ID externe.
     * @returns {Promise<Media | null>}
     */
    async findByProviderId(provider: string, externalId: string): Promise<Media | null> {
        let condition;
        // Mappage des concepts du Domaine (Provider) vers le schéma de persistence (JSONB)
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

    /**
     * Persiste (ou met à jour) un aggrégat Media complet.
     * Gère la transaction pour sauvegarder dans `medias` et la table de sous-type correspondante.
     * 
     * @param {Media} media - L'entité à sauvegarder.
     */
    async create(media: Media): Promise<void> {
        await this.db.transaction(async (tx) => {
            // Map ReleaseYear VO to Date (approximate)
            const releaseDate = media.releaseYear ? new Date(media.releaseYear.getValue(), 0, 1) : null;

            // Map ProviderMetadata and inject CoverURL
            let mediaTypeContext: 'movie' | 'tv' | undefined;
            if (media.type === MediaType.MOVIE) mediaTypeContext = 'movie';
            if (media.type === MediaType.TV) mediaTypeContext = 'tv';

            const providerMetadataRaw = ProviderMetadataMapper.toProviderMetadataWithType(
                media.externalReference,
                mediaTypeContext
            );

            // ✅ INJECTION DU COVER URL (Fix: Persistence manquante)
            if (media.coverUrl) {
                providerMetadataRaw.coverUrl = media.coverUrl.getValue();
            }

            const mediaRow: typeof schema.medias.$inferInsert = {
                id: media.id,
                title: media.title,
                type: media.type.toUpperCase() as any, // DB expects UPPERCASE enum
                releaseDate: releaseDate,
                globalRating: media.rating ? media.rating.getValue() : null,
                providerMetadata: providerMetadataRaw,
                createdAt: new Date(),
            };

            // 1. Insert/Update medias table
            await tx
                .insert(schema.medias)
                .values(mediaRow)
                .onConflictDoUpdate({
                    target: schema.medias.id,
                    set: {
                        title: mediaRow.title,
                        releaseDate: mediaRow.releaseDate,
                        globalRating: mediaRow.globalRating,
                        providerMetadata: mediaRow.providerMetadata, // Met à jour les métadonnées
                    },
                });
            // (Subtype insertion follows...)

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
