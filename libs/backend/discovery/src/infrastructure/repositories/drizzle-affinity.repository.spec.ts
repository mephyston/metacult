import { describe, it, expect, mock, beforeEach } from 'bun:test';

// --- Mocks ---
export const mockLimit = mock(() => Promise.resolve([] as any[]));
export const mockWhere = mock(() => ({ limit: mockLimit }));
export const mockSelect = mock(() => ({
  from: mock(() => ({ where: mockWhere })),
}));

export const mockOnConflictDoUpdate = mock(() => Promise.resolve());
export const mockValues = mock(() => ({
  onConflictDoUpdate: mockOnConflictDoUpdate,
}));
export const mockInsert = mock(() => ({ values: mockValues }));

import { DrizzleAffinityRepository } from './drizzle-affinity.repository';
import { Affinity } from '../../domain/entities/affinity.entity';

describe('Drizzle Affinity Repository', () => {
  let repository: DrizzleAffinityRepository;
  const dbMock = { select: mockSelect, insert: mockInsert } as any;

  beforeEach(() => {
    repository = new DrizzleAffinityRepository(dbMock);
    mockLimit.mockClear();
    mockWhere.mockClear();
    mockInsert.mockClear();
    mockValues.mockClear();
    mockOnConflictDoUpdate.mockClear();
  });

  it('should save affinity (insert/upsert)', async () => {
    const affinity = Affinity.create('u1', 'm1');
    await repository.save(affinity);

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalled();
    expect(mockOnConflictDoUpdate).toHaveBeenCalled();
  });

  it('should find user affinity', async () => {
    mockLimit.mockResolvedValueOnce([
      {
        userId: 'u1',
        mediaId: 'm1',
        score: 1250,
        lastUpdated: new Date(),
      },
    ]);

    const result = await repository.findByUserAndMedia('u1', 'm1');

    expect(mockSelect).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result?.score).toBe(1250);
  });

  it('should return null if not found', async () => {
    mockLimit.mockResolvedValueOnce([]);

    const result = await repository.findByUserAndMedia('u1', 'unknown');

    expect(result).toBeNull();
  });
});
