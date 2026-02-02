import { describe, it, expect } from 'bun:test';
import { DrizzleCatalogRepository } from './drizzle-catalog.repository';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { mediaSchema } from '@metacult/backend-catalog';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { userInteractions } from '@metacult/backend-interaction';
import { randomUUID } from 'crypto';

// Note: This test requires a running database instance.
// Safety: It uses strict TRANSACTION ROLLBACK to ensure NO data is ever committed to your local DB.
const isMockDb = process.env['DATABASE_URL']?.includes('mock');
const runIntegration =
  process.env['DATABASE_URL'] && !isMockDb ? describe : describe.skip;

runIntegration('DrizzleCatalogRepository Integration', () => {
  const { db } = getDbConnection();

  // Cleanup removed: Tests now run in isolated transactions with rollback.
  // This prevents wiping the development database if NODE_ENV is not strictly separate.

  const runInTransaction = async (
    testFn: (repo: DrizzleCatalogRepository, ids: any) => Promise<void>,
  ) => {
    await db
      .transaction(async (tx) => {
        const repository = new DrizzleCatalogRepository(tx as any);

        // Clear existing data WITHIN the transaction to ensure tests run against a clean state.
        // This is safe because the entire transaction is rolled back at the end.
        // We must delete from child tables first to satisfy constraints.
        await tx.delete(userInteractions);
        await tx.delete(mediaSchema.games);
        await tx.delete(mediaSchema.movies);
        await tx.delete(mediaSchema.tv);
        await tx.delete(mediaSchema.books);
        await tx.delete(mediaSchema.medias);

        const m1 = randomUUID(); // Trending Game
        const m2 = randomUUID(); // HallOfFame Movie
        const m3 = randomUUID(); // Controversial Show
        const m4 = randomUUID(); // Upcoming Book
        const m5 = randomUUID(); // Movie 2023 Good
        const m6 = randomUUID(); // Movie 2023 Bad

        // Seed Data within TX
        await tx.insert(mediaSchema.medias).values([
          {
            id: m1,
            slug: `game - trending - ${m1} `,
            title: 'Game Trending',
            type: 'GAME',
            matchCount: 10,
            eloScore: 1500,
            releaseDate: new Date('2020-01-01'),
          },
          {
            id: m2,
            slug: `movie - classic - ${m2} `,
            title: 'Movie Classic',
            type: 'MOVIE',
            matchCount: 100,
            eloScore: 2000,
            releaseDate: new Date('1990-01-01'),
          },
          {
            id: m3,
            slug: `show - controversial - ${m3} `,
            title: 'Show Controversial',
            type: 'TV',
            matchCount: 30,
            eloScore: 1000,
            releaseDate: new Date('2020-01-01'),
          },
          {
            id: m4,
            slug: `book - upcoming - ${m4} `,
            title: 'Book Upcoming',
            type: 'BOOK',
            matchCount: 0,
            eloScore: 1500,
            releaseDate: new Date('2099-01-01'),
          },
          {
            id: m5,
            slug: `movie - 2023 - ${m5} `,
            title: 'Movie 2023',
            type: 'MOVIE',
            matchCount: 5,
            eloScore: 1800,
            releaseDate: new Date('2023-06-01'),
          },
          {
            id: m6,
            slug: `movie - 2023 - bad - ${m6} `,
            title: 'Movie 2023 Bad',
            type: 'MOVIE',
            matchCount: 5,
            eloScore: 1200,
            releaseDate: new Date('2023-01-01'),
          },
        ]);

        await tx
          .insert(mediaSchema.games)
          .values({ id: m1, platform: [], developer: 'Dev', timeToBeat: 10 });
        await tx.insert(mediaSchema.movies).values([
          { id: m2, director: 'Dir', durationMinutes: 120 },
          { id: m5, director: 'Dir', durationMinutes: 120 },
          { id: m6, director: 'Dir', durationMinutes: 120 },
        ]);
        await tx.insert(mediaSchema.tv).values({
          id: m3,
          creator: 'Creator',
          episodesCount: 10,
          seasonsCount: 1,
        });
        await tx
          .insert(mediaSchema.books)
          .values({ id: m4, author: 'Author', pages: 100 });

        const recentDate = new Date();
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 20);

        await tx.insert(userInteractions).values([
          { userId: 'u1', mediaId: m1, action: 'LIKE', createdAt: recentDate },
          { userId: 'u2', mediaId: m1, action: 'LIKE', createdAt: recentDate },
          { userId: 'u3', mediaId: m1, action: 'LIKE', createdAt: recentDate },
          { userId: 'u1', mediaId: m2, action: 'LIKE', createdAt: oldDate },
        ]);

        await testFn(repository, { m1, m2, m3, m4, m5, m6 });

        // Rollback to keep DB clean
        tx.rollback();
      })
      .catch((e) => {
        // Drizzle throws on rollback, ignore that specific error if it's the rollback signal
        if (e.message !== 'Rollback') {
          // If it's a real error (assertion failure), rethrow
          throw e;
        }
      });
  };

  it('findTrending should return media with most recent interactions', async () => {
    await runInTransaction(async (repository, { m1 }) => {
      const results = await repository.findTrending(5);
      // We check if our seeded known trending item is present
      // Note: Because other tests might run in parallel and commit to DB, we can't assume 'results[0]' is strictly ours
      // unless we filter results by ID list we know. But findTrending doesn't accept IDs.
      // However, results should contain m1 if the algo works.
      const ids = results.map((r) => r.id);
      expect(ids).toContain(m1);
    });
  });

  it('findHallOfFame should return high elo / high match count media', async () => {
    await runInTransaction(async (repository, { m1, m2 }) => {
      const results = await repository.findHallOfFame(5);
      const ids = results.map((m) => m.id);
      expect(ids).toContain(m2);
      expect(ids).not.toContain(m1);
    });
  });

  it('findControversial should return low elo / high activity media', async () => {
    await runInTransaction(async (repository, { m3 }) => {
      const results = await repository.findControversial(5);
      const ids = results.map((r) => r.id);
      expect(ids).toContain(m3);
    });
  });

  it('findUpcoming should return future releases sorted by date', async () => {
    await runInTransaction(async (repository, { m4 }) => {
      const results = await repository.findUpcoming(5);
      const ids = results.map((r) => r.id);
      expect(ids).toContain(m4);
    });
  });

  it('findTopRatedByYear should return sorted media for specific year', async () => {
    await runInTransaction(async (repository, { m5, m6 }) => {
      const results = await repository.findTopRatedByYear(2023, 5, 'MOVIE');
      const ids = results.map((r) => r.id);
      expect(ids).toContain(m5);
      expect(ids).toContain(m6);

      // Verify order relative to each other in the results
      const m5Idx = ids.indexOf(m5);
      const m6Idx = ids.indexOf(m6);
      expect(m5Idx).toBeLessThan(m6Idx);
    });
  });
});
