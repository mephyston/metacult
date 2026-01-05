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
  getSwipedMediaIds: mock(() => Promise.resolve(['exclude-1', 'exclude-2'])),
};

// Standardized mock for @metacult/backend-identity
mock.module('@metacult/backend-identity', () => ({
  isAuthenticated: (app: any) =>
    app.derive(() => ({
      user: { id: 'test-user-id' },
    })),
  resolveUserOrThrow: async (ctx: any) => ({ id: 'test-user-id' }),
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

    controller = new FeedController(
      mockGetMixedFeedHandler as any,
      mockGetPersonalizedFeedHandler as any,
      mockInteractionRepository as any,
    );

    // Mount routes - Cast to any to avoid complex Elysia type mismatch in tests
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
});
