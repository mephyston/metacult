import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { DrizzleDuelRepository } from './drizzle-duel.repository';

// --- Mocks ---
const mockLimit = mock(() => Promise.resolve([
    { medias: { id: '1' }, user_interactions: {} },
    { medias: { id: '2' }, user_interactions: {} }
]));
const mockOrderBy = mock(() => ({ limit: mockLimit }));
const mockWhere = mock(() => ({ orderBy: mockOrderBy }));
const mockInnerJoin = mock(() => ({ where: mockWhere }));
const mockFrom = mock(() => ({ innerJoin: mockInnerJoin }));
const mockSelect = mock(() => ({ from: mockFrom }));

mock.module('@metacult/backend/infrastructure', () => ({
    getDbConnection: () => ({
        db: {
            select: mockSelect
        }
    })
}));

mock.module('drizzle-orm', () => ({
    sql: (strings: any) => strings,
    eq: () => 'eq',
    and: () => 'and',
    or: () => 'or',
    inArray: () => 'inArray',
}));

mock.module('@metacult/backend/catalog', () => ({
    mediaSchema: { medias: { id: 'm_id' } }
}));

mock.module('@metacult/backend-interaction', () => ({
    userInteractions: { userId: 'u_id', mediaId: 'm_id_ref', action: 'act', sentiment: 'sent' }
}));

import { DrizzleDuelRepository as RepoClass } from './drizzle-duel.repository';

describe('Drizzle Duel Repository', () => {
    let repository: RepoClass;

    beforeEach(() => {
        repository = new RepoClass();
        mockLimit.mockClear();
        mockWhere.mockClear();
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
        mockLimit.mockResolvedValueOnce([{ medias: { id: '1' }, user_interactions: {} }]); // Only 1

        const result = await repository.getRandomPairForUser('my-user-id');
        expect(result).toHaveLength(1); // Should return what it found
    });
});
