import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { FeedController } from '../../../index';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';
import { Result } from '@metacult/shared-core';

// --- Mocks ---
// --- Mocks ---
const mockGetMixedFeedHandler = {
  execute: mock(() =>
    Promise.resolve(
      Result.ok([{ id: '1', title: 'Test Media', type: 'movie' }]),
    ),
  ),
};

const mockGetPersonalizedFeedHandler = {
  execute: mock(() => Promise.resolve(Result.ok<any[]>([]))),
};

const mockInteractionRepository = {
  getSwipedMediaIds: mock(() => Promise.resolve(['exclude-1', 'exclude-2'])),
};

// New Mocks
const mockGetTrendingHandler = {
  execute: mock(() => Promise.resolve(Result.ok<any[]>([]))),
};
const mockGetHallOfFameHandler = {
  execute: mock(() => Promise.resolve(Result.ok<any[]>([]))),
};
const mockGetControversialHandler = {
  execute: mock(() => Promise.resolve(Result.ok<any[]>([]))),
};
const mockGetUpcomingHandler = {
  execute: mock(() => Promise.resolve(Result.ok<any[]>([]))),
};
const mockGetTopRatedByYearHandler = {
  execute: mock(() => Promise.resolve(Result.ok<any[]>([]))),
};

// Standardized mock for @metacult/backend-identity
mock.module('@metacult/backend-identity', () => ({
  isAuthenticated: (app: any) =>
    app.derive(() => ({
      user: { id: 'test-user-id' },
    })),
  resolveUserOrThrow: async () => ({ id: 'test-user-id' }),
  auth: {
    api: {
      getSession: mock(() =>
        Promise.resolve({
          user: { id: 'test-user-id' },
          session: { id: 'session-id' },
        }),
      ),
    },
  },
}));

describe('Feed Controller', () => {
  let controller: FeedController;
  let app: Elysia;

  beforeEach(() => {
    mockGetMixedFeedHandler.execute.mockClear();
    mockGetPersonalizedFeedHandler.execute.mockClear();
    mockInteractionRepository.getSwipedMediaIds.mockClear();
    mockGetTrendingHandler.execute.mockClear();
    mockGetHallOfFameHandler.execute.mockClear();
    mockGetControversialHandler.execute.mockClear();
    mockGetUpcomingHandler.execute.mockClear();
    mockGetTopRatedByYearHandler.execute.mockClear();

    controller = new FeedController(
      mockGetMixedFeedHandler as any,
      mockGetPersonalizedFeedHandler as any,
      mockInteractionRepository as any,
      mockGetTrendingHandler as any,
      mockGetHallOfFameHandler as any,
      mockGetControversialHandler as any,
      mockGetUpcomingHandler as any,
      mockGetTopRatedByYearHandler as any,
    );

    // Mount routes
    app = new Elysia().use(controller.routes() as any);
  });

  it('GET /feed should return feed for authenticated user', async () => {
    const response = await app.handle(new Request('http://localhost/feed'));

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(1);

    expect(mockInteractionRepository.getSwipedMediaIds).toHaveBeenCalledWith(
      'test-user-id',
    );

    // Cast to any to bypass strict tuple [ ] inference type error
    const calls = mockGetMixedFeedHandler.execute.mock.calls as any[];
    const lastCallArgs = calls[0]?.[0] as GetMixedFeedQuery | undefined;

    expect(lastCallArgs).toBeDefined();
    if (lastCallArgs) {
      expect(lastCallArgs.userId).toBe('test-user-id');
      expect(lastCallArgs.limit).toBe(10);
      expect(lastCallArgs.excludedMediaIds).toEqual(['exclude-1', 'exclude-2']);
    }
  });

  it('GET /feed/personalized should return personalized feed', async () => {
    // Mock handler response
    (mockGetPersonalizedFeedHandler.execute as any).mockResolvedValueOnce(
      Result.ok([{ id: 'p1', title: 'Personalized Movie' }]),
    );

    const response = await app.handle(
      new Request('http://localhost/feed/personalized'),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(1);
    expect(json[0].id).toBe('p1');

    expect(mockGetPersonalizedFeedHandler.execute).toHaveBeenCalled();
  });

  it('GET /feed/best-of/:year should return list for valid year', async () => {
    mockGetTopRatedByYearHandler.execute.mockResolvedValueOnce(
      Result.ok([{ title: 'Best of 2024' }]),
    );

    const response = await app.handle(
      new Request('http://localhost/feed/best-of/2024'),
    );

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveLength(1);
    expect(json[0].title).toBe('Best of 2024');

    expect(mockGetTopRatedByYearHandler.execute).toHaveBeenCalled();
  });

  it('GET /feed/best-of/:year should return 422 for invalid year', async () => {
    const response = await app.handle(
      new Request('http://localhost/feed/best-of/invalid'),
    );
    expect(response.status).toBe(422); // Validation error (not numeric)
  });

  it('GET /feed/best-of/:year should return 400 for year out of range', async () => {
    const response = await app.handle(
      new Request('http://localhost/feed/best-of/1800'),
    );
    expect(response.status).toBe(400); // Logical validation
    const text = await response.text();
    expect(text).toBe('Invalid Year');
  });

  it('GET /feed/trending should call GetTrendingHandler', async () => {
    const response = await app.handle(
      new Request('http://localhost/feed/trending?limit=5&type=movie'),
    );
    expect(response.status).toBe(200);
    expect(mockGetTrendingHandler.execute).toHaveBeenCalled();
  });
});
