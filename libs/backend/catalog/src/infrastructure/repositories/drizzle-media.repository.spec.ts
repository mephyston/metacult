import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { DrizzleMediaRepository } from './drizzle-media.repository';
import type { MediaId } from '../../domain/value-objects/media-id.vo';
import { ProviderSource } from '@metacult/shared-core';

// --- Chain Mocks ---
const mockExecute = mock(() =>
  Promise.resolve([
    {
      id: '1',
      title: 'Random Game',
      slug: 'random-game',
      type: 'GAME',
      providerMetadata: {},
      globalRating: 80,
      releaseDate: new Date(),
    },
    {
      id: '2',
      title: 'Random Movie',
      slug: 'random-movie',
      type: 'MOVIE',
      providerMetadata: {},
      globalRating: 80,
      releaseDate: new Date(),
    },
  ] as any[]),
);

const mockLimit = mock(() => ({
  execute: mockExecute,
  then: (resolve: any) => resolve(mockExecute()),
}));
const mockWhere = mock(() => ({
  limit: mockLimit,
  execute: mockExecute,
  then: (resolve: any) => resolve(mockExecute()),
}));
const mockLeftJoin = mock(() => ({ leftJoin: mockLeftJoin, where: mockWhere })); // Recursive chain for joins
const mockOrderBy = mock(() => ({
  where: mockWhere,
  limit: mockLimit,
  execute: mockExecute,
}));
const mockFrom = mock(() => ({ orderBy: mockOrderBy, leftJoin: mockLeftJoin }));
// mockSelect acts as the entry point, it returns the chain.
const mockSelect = mock((_?: any) => ({ from: mockFrom }));

// Tags Subquery Mocks
const mockExecuteTags = mock(() =>
  Promise.resolve([{ mediaId: '1', tagSlug: 'fps', tagLabel: 'FPS' }]),
);
const mockWhereTags = mock(() =>
  Promise.resolve([{ mediaId: '1', tagSlug: 'fps', tagLabel: 'FPS' }]),
); // execute is implied if awaitable? Drizzle awaits promise-like.
const mockInnerJoinTags = mock(() => ({ where: mockWhereTags }));
const mockFromTags = mock(() => ({ innerJoin: mockInnerJoinTags }));

// ... (other mocks unchanged)

// ...

// DB Mock
const mockDb = {
  select: mock((fields: any) => {
    // Simple heuristic to distinguish main query vs tags query
    if (fields && fields.mediaId) return { from: mockFromTags }; // Tags query
    return mockSelect(fields); // Delegates to the expected mock for the main query test (or checks calls)
  }),
  transaction: mock((cb) => cb(mockDb)),
} as any;

mock.module('@metacult/backend-infrastructure', () => ({
  logger: {
    info: () => void 0,
    error: () => void 0,
    warn: () => void 0,
    debug: () => void 0,
  },
  configService: {
    get: (key: string) => {
      if (key === 'BETTER_AUTH_URL') return 'http://localhost:3000';
      if (key === 'PUBLIC_API_URL') return 'http://localhost:3000';
      return 'mock-value';
    },
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
    isTest: true,
  },
}));

mock.module('@metacult/backend-catalog', () => ({
  mediaSchema: {
    medias: { id: 'id', title: 'title' },
    mediasToTags: { mediaId: 'mid', tagId: 'tid' },
    tags: { id: 'tid', label: 'lbl' },
  },
  // Add other necessary exports
  MediaType: { GAME: 'game', MOVIE: 'movie' },
}));

describe('DrizzleMediaRepository', () => {
  let repository: DrizzleMediaRepository;

  beforeEach(() => {
    // Constructor might expect a second arg? Checking file...
    // If constructor only takes DB, then 2nd arg is extra.
    // If it takes Logger, then 2nd arg is correct.
    repository = new DrizzleMediaRepository(mockDb as any);
    mockSelect.mockClear();
    mockFrom.mockClear();
    mockLeftJoin.mockClear();
    mockWhere.mockClear();
    mockLimit.mockClear();
    mockExecute.mockClear();
    mockOrderBy.mockClear();
  });

  it('findRandom should construct query with exclusions and limit', async () => {
    const filters = {
      excludedIds: ['exclude-1'] as any as MediaId[],
      limit: 5,
      orderBy: 'random' as const,
    };

    const result = await repository.findRandom(filters);

    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled(); // Exclusion
    expect(mockLimit).toHaveBeenCalledWith(5);
    expect(mockExecute).toHaveBeenCalled();

    expect(result).toHaveLength(2);
    if (result[0]) {
      expect(result[0].title).toBe('Random Game');
    }
  });

  it('findByProviderId should validate inputs', async () => {
    // Invalid provider (symbol)
    const result1 = await repository.findByProviderId('!', '123');
    expect(result1).toBeNull();
    expect(mockSelect).not.toHaveBeenCalled();

    // Invalid externalId (empty)
    const result2 = await repository.findByProviderId(ProviderSource.IGDB, '');
    expect(result2).toBeNull();
  });

  it('findByProviderId should construct query for valid input', async () => {
    mockExecute.mockResolvedValue([
      {
        medias: {
          id: '1',
          title: 'Random Game',
          slug: 'random-game',
          type: 'GAME',
          providerMetadata: {},
          globalRating: 80,
          releaseDate: new Date(),
        },
        games: { id: '1', platform: [], developer: 'Dev', timeToBeat: 10 },
        movies: null,
        tv: null,
        books: null,
      },
    ]);

    const result = await repository.findByProviderId(
      ProviderSource.IGDB,
      'valid-id',
    );

    expect(mockSelect).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalled();
    expect(mockLeftJoin).toHaveBeenCalledTimes(4); // 4 joins
    expect(mockWhere).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(1);
    expect(mockExecute).toHaveBeenCalled();
  });
});
