import { describe, expect, it, mock, spyOn } from 'bun:test';
import { ComputeNeighborsService } from './compute-neighbors.service';
import type { AffinityRepository } from '../../domain/ports/affinity.repository.interface';
import type { SimilarityRepository } from '../../domain/ports/similarity.repository.interface';
import { SimilarityCalculator } from '../../domain/services/similarity-calculator.service';
import { Neighbor } from '../../domain/entities/neighbor.entity';
import { Affinity } from '../../domain/entities/affinity.entity';

describe('ComputeNeighborsService', () => {
  // Mock DB
  const mockDb = {
    execute: mock(),
  };

  // Mock Repositories
  const mockAffinityRepo: AffinityRepository = {
    save: mock(() => Promise.resolve()),
    findByUserAndMedia: mock(() => Promise.resolve(null)),
    findByUser: mock(() => Promise.resolve([])),
  };

  const mockSimilarityRepo: SimilarityRepository = {
    save: mock(() => Promise.resolve()),
    getNeighbors: mock(() => Promise.resolve([])),
  };

  // Mock Calculator (not strictly necessary but good for isolation)
  const mockCalculator = {
    calculate: mock((a: any, b: any) => 0.5),
  } as any as SimilarityCalculator;

  const service = new ComputeNeighborsService(
    mockDb as any,
    mockAffinityRepo,
    mockSimilarityRepo,
  );

  // FIX: Clear mocks between tests
  (mockAffinityRepo.findByUser as any).mockClear();
  (mockSimilarityRepo.save as any).mockClear();
  mockDb.execute.mockClear();

  it('should process users and save neighbors', async () => {
    // 1. Mock finding users
    mockDb.execute.mockResolvedValueOnce({
      rows: [{ user_id: 'u1' }],
    });

    // 2. Mock finding candidates for u1
    // Return u2 and u3 as candidates
    mockDb.execute.mockResolvedValueOnce({
      rows: [
        { neighbor_id: 'u2', shared_count: 5 },
        { neighbor_id: 'u3', shared_count: 4 },
      ],
    });

    // 3. Mock Repositories finding affinities
    const u1Affinities = [Affinity.create('u1', 'm1', 1400)];
    const u2Affinities = [Affinity.create('u2', 'm1', 1400)];
    const u3Affinities = [Affinity.create('u3', 'm1', 1400)];

    (mockAffinityRepo.findByUser as any)
      .mockResolvedValueOnce(u1Affinities) // For u1
      .mockResolvedValueOnce(u2Affinities) // For u2
      .mockResolvedValueOnce(u3Affinities); // For u3

    // 4. Execute
    await service.execute();

    // 5. Verify
    expect(mockDb.execute).toHaveBeenCalledTimes(2); // Get users + Get candidates
    expect(mockAffinityRepo.findByUser).toHaveBeenCalledTimes(3); // u1, u2, u3
    expect(mockSimilarityRepo.save).toHaveBeenCalledTimes(2); // saved u2 and u3 (both mock calc returns 0.5 > 0)
  });

  it('should ignore users with no candidates', async () => {
    // Clear mocks manually for this test case isolation
    mockDb.execute.mockClear();
    (mockAffinityRepo.findByUser as any).mockClear();
    (mockSimilarityRepo.save as any).mockClear();

    mockDb.execute.mockResolvedValueOnce({
      rows: [{ user_id: 'u1' }],
    });

    // No candidates
    mockDb.execute.mockResolvedValueOnce({
      rows: [],
    });

    await service.execute();

    expect(mockAffinityRepo.findByUser).not.toHaveBeenCalled();
    expect(mockSimilarityRepo.save).not.toHaveBeenCalled();
  });
});
