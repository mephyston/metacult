import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { DEFAULT_DEV_URLS } from '@metacult/shared-core';

// --- Exposed Mocks ---
export const mockLimit = mock(() =>
  Promise.resolve([
    { medias: { id: '1' }, user_interactions: {} },
    { medias: { id: '2' }, user_interactions: {} },
  ] as any[]),
);
export const mockOrderBy = mock(() => ({ limit: mockLimit }));
// where() can filter, and it can be followed by limit directly OR orderBy
export const mockWhere = mock(() => ({
  orderBy: mockOrderBy,
  limit: mockLimit,
}));
export const mockInnerJoin = mock(() => ({ where: mockWhere }));
// from() can be followed by innerJoin OR where directly
export const mockFrom = mock(() => ({
  innerJoin: mockInnerJoin,
  where: mockWhere,
}));
export const mockSelect = mock(() => ({ from: mockFrom }));

// Transaction Mocks
export const mockUpdateSet = mock(() => ({
  where: mock(() => Promise.resolve()),
}));
export const mockTx = {
  update: mock(() => ({ set: mockUpdateSet })),
};
export const mockTransaction = mock(async (cb: any) => cb(mockTx));

mock.module('@metacult/backend-infrastructure', () => ({
  getDbConnection: () => ({
    db: {
      select: mockSelect,
      transaction: mockTransaction,
    },
  }),
  logger: {
    info: () => void 0,
    error: () => void 0,
    warn: () => void 0,
    debug: () => void 0,
  },
  configService: {
    get: (key: string) => {
      // Use shared constants as requested by user
      if (key === 'BETTER_AUTH_URL') return DEFAULT_DEV_URLS.API;
      if (key === 'PUBLIC_API_URL') return DEFAULT_DEV_URLS.API;
      return 'mock-value';
    },
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
    isTest: true,
  },
}));

mock.module('drizzle-orm', () => ({
  sql: (strings: any) => strings,
  eq: () => 'eq',
  and: () => 'and',
  or: () => 'or',
  inArray: () => 'inArray',
}));

mock.module('@metacult/backend-catalog', () => ({
  mediaSchema: { medias: { id: 'm_id' } },
}));

mock.module('@metacult/backend-interaction', () => ({
  userInteractions: {
    userId: 'u_id',
    mediaId: 'm_id_ref',
    action: 'act',
    sentiment: 'sent',
  },
}));

import { DrizzleDuelRepository as RepoClass } from './drizzle-duel.repository';

describe('Drizzle Duel Repository', () => {
  let repository: RepoClass;

  beforeEach(() => {
    repository = new RepoClass();
    mockLimit.mockClear();
    mockWhere.mockClear();
    mockTx.update.mockClear();
    mockUpdateSet.mockClear();
    mockTransaction.mockClear();
  });

  it('should fetch 2 random medias for user', async () => {
    const result = await repository.getRandomPairForUser('my-user-id');

    expect(mockSelect).toHaveBeenCalled();
    expect(mockInnerJoin).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(mockLimit).toHaveBeenCalledWith(2);

    expect(result).toHaveLength(2);
    // @ts-expect-error - Mock result typing
    expect(result[0].id).toBe('1');
  });

  it('should return empty array if not enough media (no throw)', async () => {
    mockLimit.mockResolvedValueOnce([
      { medias: { id: '1' }, user_interactions: {} },
    ]); // Only 1

    const result = await repository.getRandomPairForUser('my-user-id');
    expect(result).toHaveLength(1); // Should return what it found
  });

  // --- New Tests for Refactoring ---

  it('should find media by ID', async () => {
    // findById uses simple select, so returns flat objects, not joined structure
    mockLimit.mockResolvedValueOnce([{ id: '123' }]);

    const result = await repository.findById('123');

    expect(mockSelect).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    // @ts-expect-error - Mock result typing
    expect(result.id).toBe('123');
  });

  it('should return undefined if media not found', async () => {
    mockLimit.mockResolvedValueOnce([]); // Empty result

    const result = await repository.findById('unknown');

    expect(result).toBeUndefined();
  });

  it('should update elo scores transactionally', async () => {
    // 1. Call Update
    await repository.updateEloScores('win-1', 1200, 'loss-1', 1100);

    // 2. Verify Transaction Started
    expect(mockTransaction).toHaveBeenCalledTimes(1);

    // 3. Verify Updates inside Transaction
    // Should be called twice (winner and loser)
    expect(mockTx.update).toHaveBeenCalledTimes(2);
    expect(mockUpdateSet).toHaveBeenCalledTimes(2);
  });
});
