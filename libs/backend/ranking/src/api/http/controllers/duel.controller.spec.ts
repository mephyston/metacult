import { describe, it, expect, mock, spyOn, beforeEach } from 'bun:test';
import { Elysia } from 'elysia';

// Mock Identity - Inject a Fake User
mock.module(
  '../../../../../identity/src/api/middleware/auth.middleware.ts',
  () => {
    return {
      isAuthenticated: (app: any) =>
        app.derive(() => ({
          user: { id: 'test-user-id' },
        })),
      resolveUserOrThrow: async () => ({ id: 'test-user-id' }),
    };
  },
);

// Standardized mock for @metacult/backend-identity
mock.module('@metacult/backend-identity', () => {
  return {
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
  };
});

import { DrizzleDuelRepository } from '../../../infrastructure/repositories/drizzle-duel.repository';
import { RankingQueue } from '../../../infrastructure/queue/ranking.queue';

// Spies
const mockGetRandomPairForUser = mock(() =>
  Promise.resolve([
    { id: '1', title: 'A' },
    { id: '2', title: 'B' },
  ] as { id: string; title: string }[]),
);
const mockAddDuelResult = mock(() => Promise.resolve());

spyOn(
  DrizzleDuelRepository.prototype,
  'getRandomPairForUser',
).mockImplementation(mockGetRandomPairForUser as unknown as any); // Casting as any here because spying on prototype methods with incompatible signatures is hard in Bun test, keeping it minimal but explicit about unknown
spyOn(RankingQueue.prototype, 'addDuelResult').mockImplementation(
  mockAddDuelResult as unknown as any,
);

import { DuelController } from './duel.controller';

describe('Duel Controller', () => {
  const app = new Elysia().use(DuelController);

  beforeEach(() => {
    mockGetRandomPairForUser.mockClear();
    mockAddDuelResult.mockClear();
  });

  it('GET /duel should return a pair for the user', async () => {
    const response = await app.handle(new Request('http://localhost/duel'));

    expect(response.status).toBe(200);
    const json = await response.json();

    expect(json).toHaveLength(2);
    expect(mockGetRandomPairForUser).toHaveBeenCalledWith('test-user-id');
  });

  it('GET /duel should handle insufficient likes', async () => {
    // Mock asking for user but getting empty list
    mockGetRandomPairForUser.mockResolvedValueOnce([]);

    const response = await app.handle(new Request('http://localhost/duel'));

    expect(response.status).toBe(200);
    const json = await response.json();

    // Expect specific error structure
    expect(json.meta.status).toBe('insufficient_likes');
    expect(json.data).toHaveLength(0);
  });

  it('POST /duel/vote should record vote', async () => {
    // ... (unchanged logic, as vote doesn't strictly depend on user filtering yet, though typically it should check validity)
    const body = JSON.stringify({ winnerId: '1', loserId: '2' });

    const response = await app.handle(
      new Request('http://localhost/duel/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    );

    expect(response.status).toBe(200);
    expect(mockAddDuelResult).toHaveBeenCalledWith('1', '2');
  });
});
