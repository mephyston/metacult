import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';
import { FeedController } from './feed.controller';
import { GetMixedFeedQuery } from '../../../application/queries/get-mixed-feed/get-mixed-feed.query';

// --- Mocks ---
const mockGetMixedFeedHandler = {
  execute: mock(() =>
    Promise.resolve([{ id: '1', title: 'Test Media', type: 'movie' }]),
  ),
};

const mockGetPersonalizedFeedHandler = {
  execute: mock(() => Promise.resolve([])),
};

const mockInteractionRepository = {
  getSwipedMediaIds: mock(() => Promise.resolve(['exclude-1'])),
};

// Standardized mock for @metacult/backend-identity - GUEST VERSION (No User)
mock.module('@metacult/backend-identity', () => ({
  isAuthenticated: (app: any) => app, // Passthrough - no user injection for guest
  resolveUserOrThrow: async (ctx: any) => {
    throw new Error('Unauthorized'); // Guest should fail auth
  },
  auth: {
    api: {
      getSession: mock(() => Promise.resolve({ user: null, session: null })),
    },
  },
}));

const mockGetTrendingHandler = { execute: mock(() => Promise.resolve([])) };
const mockGetHallOfFameHandler = { execute: mock(() => Promise.resolve([])) };
const mockGetHiddenGemsHandler = { execute: mock(() => Promise.resolve([])) };
const mockSearchMediaHandler = { execute: mock(() => Promise.resolve([])) };
const mockSearchAdvancedHandler = { execute: mock(() => Promise.resolve([])) };

describe('Feed Controller (Guest)', () => {
  let controller: FeedController;
  let app: Elysia;

  beforeEach(() => {
    mockGetMixedFeedHandler.execute.mockClear();
    mockGetPersonalizedFeedHandler.execute.mockClear();
    mockInteractionRepository.getSwipedMediaIds.mockClear();
    mockGetTrendingHandler.execute.mockClear();
    mockGetHallOfFameHandler.execute.mockClear();
    mockGetHiddenGemsHandler.execute.mockClear();
    mockSearchMediaHandler.execute.mockClear();
    mockSearchAdvancedHandler.execute.mockClear();

    controller = new FeedController(
      mockGetMixedFeedHandler as any,
      mockGetPersonalizedFeedHandler as any,
      mockGetTrendingHandler as any,
      mockGetHallOfFameHandler as any,
      mockGetHiddenGemsHandler as any,
      mockSearchMediaHandler as any,
      mockSearchAdvancedHandler as any,
      mockInteractionRepository as any,
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
