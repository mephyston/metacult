// noinspection DuplicatedCode
import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { FeedController } from './feed.controller';
import { GetMixedFeedQuery } from '../../../index';
import { Result } from '@metacult/shared-core';

// --- Mocks ---
const mockGetMixedFeedHandler = {
  execute: mock(() =>
    Promise.resolve(
      Result.ok([{ id: '1', title: 'Test Media', type: 'movie' }]),
    ),
  ),
};

const mockGetPersonalizedFeedHandler = {
  execute: mock(() => Promise.resolve(Result.ok([]))),
};

const mockInteractionRepository = {
  getSwipedMediaIds: mock(() => Promise.resolve(['exclude-1'])),
};

// Standardized mock for @metacult/backend-identity - GUEST VERSION (No User)
mock.module('@metacult/backend-identity', () => ({
  isAuthenticated: (app: any) => app, // Passthrough - no user injection for guest
  resolveUserOrThrow: async () => {
    throw new Error('Unauthorized'); // Guest should fail auth
  },
  auth: {
    api: {
      getSession: mock(() => Promise.resolve({ user: null, session: null })),
    },
  },
}));

const mockGetTrendingHandler = {
  execute: mock(() => Promise.resolve(Result.ok([]))),
};
const mockGetHallOfFameHandler = {
  execute: mock(() => Promise.resolve(Result.ok([]))),
};
const mockGetControversialHandler = {
  execute: mock(() => Promise.resolve(Result.ok([]))),
};
const mockGetUpcomingHandler = {
  execute: mock(() => Promise.resolve(Result.ok([]))),
};
const mockGetTopRatedByYearHandler = {
  execute: mock(() => Promise.resolve(Result.ok([]))),
};

describe('Feed Controller (Guest)', () => {
  // noinspection DuplicatedCode
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

    app = new Elysia().use(controller.routes() as any);
  });

  it('GET /feed should return limited feed for guest', async () => {
    const response = await app.handle(new Request('http://localhost/feed'));

    expect(response.status).toBe(200);

    expect(mockInteractionRepository.getSwipedMediaIds).not.toHaveBeenCalled();

    // Cast to any to bypass strict tuple [ ] inference type error
    const calls = mockGetMixedFeedHandler.execute.mock.calls as any[];
    const lastCallArgs = calls[0]?.[0] as GetMixedFeedQuery | undefined;

    expect(lastCallArgs).toBeDefined();
    if (lastCallArgs) {
      expect(lastCallArgs.userId).toBeUndefined();
      expect(lastCallArgs.limit).toBe(5); // Guest limit
      expect(lastCallArgs.excludedMediaIds).toEqual([]);
    }
  });
});
