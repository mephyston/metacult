import { describe, it, expect, mock, beforeEach } from 'bun:test';

// --- Mocks ---
export const mockOrderBy = mock(() => Promise.resolve([] as any[]));
export const mockWhere = mock(() => ({ orderBy: mockOrderBy }));
export const mockSelect = mock(() => ({
  from: mock(() => ({ where: mockWhere })),
}));

export const mockOnConflictDoUpdate = mock(() => Promise.resolve());
export const mockValues = mock(() => ({
  onConflictDoUpdate: mockOnConflictDoUpdate,
}));
export const mockInsert = mock(() => ({ values: mockValues }));

mock.module('@metacult/backend-infrastructure', () => ({
  getDbConnection: () => ({
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
  }),
  logger: {
    info: () => null,
    error: () => null,
    warn: () => null,
    debug: () => null,
  },
  configService: {
    get: () => 'http://mock-url.com',
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
    isTest: true,
  },
}));

mock.module('drizzle-orm', () => ({
  sql: (strings: any) => strings,
  eq: () => 'eq',
}));

import { DrizzleSimilarityRepository } from './drizzle-similarity.repository';
import { Neighbor } from '../../domain/entities/neighbor.entity';

describe('Drizzle Similarity Repository', () => {
  let repository: DrizzleSimilarityRepository;
  const dbMock = { select: mockSelect, insert: mockInsert } as any;

  beforeEach(() => {
    repository = new DrizzleSimilarityRepository(dbMock);
    mockOrderBy.mockClear();
    mockWhere.mockClear();
    mockInsert.mockClear();
    mockValues.mockClear();
    mockOnConflictDoUpdate.mockClear();
  });

  it('should save neighbor (insert/upsert)', async () => {
    const neighbor = Neighbor.create('u1', 'n1', 0.85);
    await repository.save(neighbor);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalled();
    expect(mockOnConflictDoUpdate).toHaveBeenCalled();
  });

  it('should get neighbors sorted by score', async () => {
    mockOrderBy.mockResolvedValueOnce([
      {
        userId: 'u1',
        neighborId: 'n1',
        similarityScore: 0.9,
        lastUpdated: new Date(),
      },
      {
        userId: 'u1',
        neighborId: 'n2',
        similarityScore: 0.5,
        lastUpdated: new Date(),
      },
    ]);

    const result = await repository.getNeighbors('u1');

    expect(mockSelect).toHaveBeenCalled();
    expect(mockWhere).toHaveBeenCalled();
    expect(mockOrderBy).toHaveBeenCalled();
    expect(result).toHaveLength(2);
    expect(result?.[0]?.similarityScore).toBe(0.9);
  });
});
