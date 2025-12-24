import { eq, ilike, and, or, desc, sql } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres'; // Assuming NodePg or similar. User said "Bun", so maybe 'drizzle-orm/bun-sql' or generic Postgres. I'll use generic Database type.
import type { IWorkRepository, WorkSearchFilters } from '@metacult/backend/domain';
import { WorkType } from '@metacult/backend/domain';
import type { Work, Game, Movie } from '@metacult/backend/domain';
import * as schema from '../db/schema';

// Helper type for the DB instance
type Db = NodePgDatabase<typeof schema>;

export class DrizzleWorkRepository implements IWorkRepository {
    constructor(private readonly db: Db) { }

    async findById(id: string): Promise<Work | null> {
        // Polymorphic fetch using left joins to hydrate specific fields
        const rows = await this.db
            .select()
            .from(schema.works)
            .leftJoin(schema.games, eq(schema.works.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.works.id, schema.movies.id))
            .where(eq(schema.works.id, id))
            .limit(1);

        if (rows.length === 0) return null;

        if (rows.length === 0 || !rows[0]) return null;

        return this.mapRowToEntity(rows[0]);
    }

    async search(filters: WorkSearchFilters): Promise<Work[]> {
        console.log('🔍 REPO: Executing search (Version with NO GROUP BY)');
        const query = this.db
            .select()
            .from(schema.works)
            .leftJoin(schema.games, eq(schema.works.id, schema.games.id))
            .leftJoin(schema.movies, eq(schema.works.id, schema.movies.id))
            // Join tags if filtering by tag
            .leftJoin(schema.worksToTags, eq(schema.works.id, schema.worksToTags.workId))
            .leftJoin(schema.tags, eq(schema.worksToTags.tagId, schema.tags.id));

        const conditions = [];

        if (filters.type) {
            conditions.push(eq(schema.works.type, filters.type));
        }

        if (filters.search) {
            conditions.push(ilike(schema.works.title, `%${filters.search}%`));
        }

        if (filters.tag) {
            conditions.push(eq(schema.tags.slug, filters.tag));
        }

        if (conditions.length > 0) {
            query.where(and(...conditions));
        }

        // query.groupBy(schema.works.id, schema.games.id, schema.movies.id);

        // Order by latest
        query.orderBy(desc(schema.works.createdAt));

        const rows = await query.execute();

        // Deduplicate rows in memory (because joined tags create duplicates)
        const uniqueWorksMap = new Map<string, Work>();
        for (const row of rows) {
            if (!uniqueWorksMap.has(row.works.id)) {
                uniqueWorksMap.set(row.works.id, this.mapRowToEntity(row));
            }
        }

        return Array.from(uniqueWorksMap.values());
    }

    async create(work: Work): Promise<void> {
        await this.db.transaction(async (tx) => {
            // 1. Insert into base works table
            await tx.insert(schema.works).values({
                id: work.id, // ID must be provided (UUID)
                title: work.title,
                type: work.type,
                releaseDate: work.releaseDate,
                globalRating: work.globalRating,
                createdAt: work.createdAt,
            });

            // 2. Insert into specific extension table
            if (work.type === WorkType.GAME) {
                const game = work as Game;
                await tx.insert(schema.games).values({
                    id: work.id,
                    platform: game.platform,
                    developer: game.developer,
                    timeToBeat: game.timeToBeat,
                });
            } else if (work.type === WorkType.MOVIE) {
                const movie = work as Movie;
                await tx.insert(schema.movies).values({
                    id: work.id,
                    director: movie.director,
                    durationMinutes: movie.durationMinutes,
                });
            }
        });
    }

    private mapRowToEntity(row: {
        works: typeof schema.works.$inferSelect;
        games: typeof schema.games.$inferSelect | null;
        movies: typeof schema.movies.$inferSelect | null;
    }): Work {
        const baseWork = {
            id: row.works.id,
            title: row.works.title,
            type: row.works.type as WorkType,
            releaseDate: row.works.releaseDate,
            globalRating: row.works.globalRating,
            createdAt: row.works.createdAt,
        };

        switch (row.works.type) {
            case WorkType.GAME:
                if (!row.games) throw new Error(`Data integrity error: Work ${baseWork.id} is TYPE GAME but has no games record.`);
                return {
                    ...baseWork,
                    type: WorkType.GAME,
                    platform: row.games.platform as string[],
                    developer: row.games.developer,
                    timeToBeat: row.games.timeToBeat,
                } as Game;

            case WorkType.MOVIE:
                if (!row.movies) throw new Error(`Data integrity error: Work ${baseWork.id} is TYPE MOVIE but has no movies record.`);
                return {
                    ...baseWork,
                    type: WorkType.MOVIE,
                    director: row.movies.director,
                    durationMinutes: row.movies.durationMinutes,
                } as Movie;

            default:
                return baseWork as Work;
        }
    }
}
