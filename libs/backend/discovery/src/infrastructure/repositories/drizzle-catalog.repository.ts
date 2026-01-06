import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, gte, gt, between, sql, asc, desc } from 'drizzle-orm';
import {
  mediaSchema,
  Media,
  Game,
  Movie,
  TV,
  Book,
  ExternalReference,
  Rating,
  CoverUrl,
  ReleaseYear,
} from '@metacult/backend-catalog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { userInteractions } from '@metacult/backend-interaction';
import type { CatalogRepository } from '../../domain/ports/catalog.repository.interface';

// Helper types for strict typing
type Db = NodePgDatabase<typeof mediaSchema>;

export class DrizzleCatalogRepository implements CatalogRepository {
  constructor(private readonly db: Db) {}

  private getBaseQuery() {
    return this.db
      .select()
      .from(mediaSchema.medias)
      .leftJoin(
        mediaSchema.games,
        eq(mediaSchema.medias.id, mediaSchema.games.id),
      )
      .leftJoin(
        mediaSchema.movies,
        eq(mediaSchema.medias.id, mediaSchema.movies.id),
      )
      .leftJoin(mediaSchema.tv, eq(mediaSchema.medias.id, mediaSchema.tv.id))
      .leftJoin(
        mediaSchema.books,
        eq(mediaSchema.medias.id, mediaSchema.books.id),
      );
  }

  async findTrending(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter type handling: SHOW -> TV mapping
    const dbType = type === 'SHOW' ? 'TV' : type;

    // Note: To join with base query joins + interaction count, we might need a subquery or strict group by
    // But Drizzle ORM GroupBy with many joined columns is verbose.
    // Simplification: Fetch IDs first via aggregation, then fetch full entities.

    const trendingIds = await this.db
      .select({
        id: mediaSchema.medias.id,
        count: sql<number>`count(${userInteractions.id})`,
      })
      .from(mediaSchema.medias)
      .leftJoin(
        userInteractions,
        eq(mediaSchema.medias.id, userInteractions.mediaId),
      )
      .where(
        and(
          gte(userInteractions.createdAt, sevenDaysAgo),
          dbType ? eq(mediaSchema.medias.type, dbType) : undefined,
        ),
      )
      .groupBy(mediaSchema.medias.id)
      .orderBy(desc(sql`count(${userInteractions.id})`))
      .limit(limit);

    if (trendingIds.length === 0) return [];

    const ids = trendingIds.map((r) => r.id);
    const rows = await this.getBaseQuery().where(
      sql`${mediaSchema.medias.id} IN ${ids}`,
    );

    // Sort rows by the order of trending IDs (Postgres IN doesn't preserve order)
    const rowMap = new Map(rows.map((r) => [r.medias.id, r]));
    return ids
      .map((id) => rowMap.get(id))
      .filter((r) => !!r)
      .map((row) => this.mapRowToEntity(row!));
  }

  async findHallOfFame(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]> {
    const dbType = type === 'SHOW' ? 'TV' : type;

    const rows = await this.getBaseQuery()
      .where(
        and(
          gte(mediaSchema.medias.matchCount, 50),
          dbType ? eq(mediaSchema.medias.type, dbType) : undefined,
        ),
      )
      .orderBy(desc(mediaSchema.medias.eloScore))
      .limit(limit);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findControversial(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]> {
    const dbType = type === 'SHOW' ? 'TV' : type;

    const rows = await this.getBaseQuery()
      .where(
        and(
          gt(mediaSchema.medias.matchCount, 20),
          between(mediaSchema.medias.eloScore, 900, 1300),
          dbType ? eq(mediaSchema.medias.type, dbType) : undefined,
        ),
      )
      .orderBy(desc(mediaSchema.medias.matchCount))
      .limit(limit);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findUpcoming(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]> {
    const dbType = type === 'SHOW' ? 'TV' : type;
    const now = new Date();

    const rows = await this.getBaseQuery()
      .where(
        and(
          gt(mediaSchema.medias.releaseDate, now),
          dbType ? eq(mediaSchema.medias.type, dbType) : undefined,
        ),
      )
      .orderBy(asc(mediaSchema.medias.releaseDate))
      .limit(limit);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  async findTopRatedByYear(
    year: number,
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]> {
    const dbType = type === 'SHOW' ? 'TV' : type;
    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const rows = await this.getBaseQuery()
      .where(
        and(
          between(mediaSchema.medias.releaseDate, startOfYear, endOfYear),
          dbType ? eq(mediaSchema.medias.type, dbType) : undefined,
        ),
      )
      .orderBy(desc(mediaSchema.medias.eloScore))
      .limit(limit);

    return rows.map((row) => this.mapRowToEntity(row));
  }

  private mapRowToEntity(row: {
    medias: typeof mediaSchema.medias.$inferSelect;
    games: typeof mediaSchema.games.$inferSelect | null;
    movies: typeof mediaSchema.movies.$inferSelect | null;
    tv: typeof mediaSchema.tv.$inferSelect | null;
    books: typeof mediaSchema.books.$inferSelect | null;
  }): Media {
    const {
      id,
      title,
      slug,
      type,
      globalRating,
      releaseDate,
      providerMetadata,
      eloScore,
    } = row.medias;

    const externalReference = new ExternalReference('unknown', 'unknown');
    // Simple metadata parse if needed

    let coverUrlStr: string | null = null;
    if (providerMetadata) {
      const meta = providerMetadata as any;
      if (meta.coverUrl) {
        coverUrlStr = meta.coverUrl;
      } else if (meta.poster_path) {
        const path = meta.poster_path.startsWith('/')
          ? meta.poster_path
          : `/${meta.poster_path}`;
        coverUrlStr = `https://image.tmdb.org/t/p/original${path}`;
      } else if (meta.image_id) {
        coverUrlStr = `https://images.igdb.com/igdb/image/upload/t_1080p/${meta.image_id}.jpg`;
      }
    }

    const coverUrl = coverUrlStr ? new CoverUrl(coverUrlStr) : null;

    const rating = globalRating ? new Rating(globalRating) : null;
    const releaseYear = releaseDate
      ? new ReleaseYear(releaseDate.getFullYear())
      : null;

    switch (type) {
      case 'GAME':
        return new Game(
          id,
          title,
          slug,
          null,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          (row.games?.platform as string[]) || [],
          row.games?.developer || '',
          row.games?.timeToBeat || 0,
        );
      case 'MOVIE':
        return new Movie(
          id,
          title,
          slug,
          null,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          row.movies?.director || '',
          row.movies?.durationMinutes || 0,
        );
      case 'TV':
        return new TV(
          id,
          title,
          slug,
          null,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          row.tv?.creator || '',
          row.tv?.episodesCount || 0,
          row.tv?.seasonsCount || 0,
        );
      case 'BOOK':
        return new Book(
          id,
          title,
          slug,
          null,
          coverUrl,
          rating,
          releaseYear,
          externalReference,
          row.books?.author || '',
          row.books?.pages || 0,
        );
      default:
        throw new Error(`Unknown Type: ${type}`);
    }
  }
}
