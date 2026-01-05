/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { describe, it, expect, beforeEach, afterAll } from 'bun:test';
import { DrizzleCatalogRepository } from './drizzle-catalog.repository';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { mediaSchema } from '@metacult/backend-catalog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { userInteractions } from '@metacult/backend-interaction';
import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';

// Note: This test requires a running database instance.
// It performs REAL SQL queries.

describe('DrizzleCatalogRepository Integration', () => {
  const { db } = getDbConnection();
  // eslint-disable-next-line
  const repository = new DrizzleCatalogRepository(db as any);

  const m1 = randomUUID(); // Trending Game
  const m2 = randomUUID(); // HallOfFame Movie
  const m3 = randomUUID(); // Controversial Show
  const m4 = randomUUID(); // Upcoming Book
  const m5 = randomUUID(); // Movie 2023 Good
  const m6 = randomUUID(); // Movie 2023 Bad

  const cleanup = async () => {
    await db.execute(sql`DROP INDEX IF EXISTS interaction.media_idx`);
    await db.delete(userInteractions).execute();
    await db.delete(mediaSchema.medias).execute();
  };

  beforeEach(async () => {
    await cleanup();

    // Seed Data
    await db
      .insert(mediaSchema.medias)
      .values([
        {
          id: m1,
          slug: 'game-trending',
          title: 'Game Trending',
          type: 'GAME',
          matchCount: 10,
          eloScore: 1500,
          releaseDate: new Date('2020-01-01'),
        },
        {
          id: m2,
          slug: 'movie-classic',
          title: 'Movie Classic',
          type: 'MOVIE',
          matchCount: 100,
          eloScore: 2000,
          releaseDate: new Date('1990-01-01'),
        },
        {
          id: m3,
          slug: 'show-controversial',
          title: 'Show Controversial',
          type: 'TV',
          matchCount: 30,
          eloScore: 1000,
          releaseDate: new Date('2020-01-01'),
        },
        {
          id: m4,
          slug: 'book-upcoming',
          title: 'Book Upcoming',
          type: 'BOOK',
          matchCount: 0,
          eloScore: 1500,
          releaseDate: new Date('2099-01-01'),
        },
        {
          id: m5,
          slug: 'movie-2023',
          title: 'Movie 2023',
          type: 'MOVIE',
          matchCount: 5,
          eloScore: 1800,
          releaseDate: new Date('2023-06-01'),
        },
        {
          id: m6,
          slug: 'movie-2023-bad',
          title: 'Movie 2023 Bad',
          type: 'MOVIE',
          matchCount: 5,
          eloScore: 1200,
          releaseDate: new Date('2023-01-01'),
        },
      ])
      .execute();

    // Needs sub-table records for mapRowToEntity to work!
    await db
      .insert(mediaSchema.games)
      .values({ id: m1, platform: [], developer: 'Dev', timeToBeat: 10 })
      .execute();
    await db
      .insert(mediaSchema.movies)
      .values([
        { id: m2, director: 'Dir', durationMinutes: 120 },
        { id: m5, director: 'Dir', durationMinutes: 120 },
        { id: m6, director: 'Dir', durationMinutes: 120 },
      ])
      .execute();
    await db
      .insert(mediaSchema.tv)
      .values({
        id: m3,
        creator: 'Creator',
        episodesCount: 10,
        seasonsCount: 1,
      })
      .execute();
    await db
      .insert(mediaSchema.books)
      .values({ id: m4, author: 'Author', pages: 100 })
      .execute();

    // Seed Interactions for Trending (m1 has many recent interactions)
    const recentDate = new Date();
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 20);

    await db
      .insert(userInteractions)
      .values([
        { userId: 'u1', mediaId: m1, action: 'LIKE', createdAt: recentDate },
        { userId: 'u2', mediaId: m1, action: 'LIKE', createdAt: recentDate },
        { userId: 'u3', mediaId: m1, action: 'LIKE', createdAt: recentDate },
        { userId: 'u1', mediaId: m2, action: 'LIKE', createdAt: oldDate },
      ])
      .execute();
  });

  afterAll(async () => {
    await cleanup();
  });

  it('findTrending should return media with most recent interactions', async () => {
    const results = await repository.findTrending(5);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.id).toBe(m1);
  });

  it('findHallOfFame should return high elo / high match count media', async () => {
    const results = await repository.findHallOfFame(5);
    const ids = results.map((m) => m.id);
    expect(ids).toContain(m2);
    expect(ids).not.toContain(m1);
  });

  it('findControversial should return low elo / high activity media', async () => {
    const results = await repository.findControversial(5);
    expect(results.length).toBe(1);
    expect(results[0]!.id).toBe(m3);
  });

  it('findUpcoming should return future releases sorted by date', async () => {
    const results = await repository.findUpcoming(5);
    expect(results.length).toBe(1);
    expect(results[0]!.id).toBe(m4);
  });

  it('findTopRatedByYear should return sorted media for specific year', async () => {
    const results = await repository.findTopRatedByYear(2023, 5, 'MOVIE');
    expect(results.length).toBe(2);
    // m5 (1800) should be before m6 (1200)
    expect(results[0]!.id).toBe(m5);
    expect(results[1]!.id).toBe(m6);
  });
});
