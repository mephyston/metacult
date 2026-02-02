import { describe, expect, it, mock } from 'bun:test';
import {
  ComputeNeighborsService,
  type AffinityRepository,
  type SimilarityRepository,
} from '../../index';
import { Affinity } from '../../domain/entities/affinity.entity';

describe('ComputeNeighborsService', () => {
  // Mock Repositories
  const mockAffinityRepo: AffinityRepository = {
    save: mock(() => Promise.resolve()),
    findByUserAndMedia: mock(() => Promise.resolve(null)),
    findByUser: mock(() => Promise.resolve([])),
    findAllUsersWithAffinity: mock(() => Promise.resolve([])),
    findCandidateNeighbors: mock(() => Promise.resolve([])),
  };

  const mockSimilarityRepo: SimilarityRepository = {
    save: mock(() => Promise.resolve()),
    getNeighbors: mock(() => Promise.resolve([])),
  };

  // Mock Calculator removed as unused

  const service = new ComputeNeighborsService(
    mockAffinityRepo,
    mockSimilarityRepo,
  );

  // FIX: Clear mocks between tests
  (mockAffinityRepo.findByUser as any).mockClear();
  (mockAffinityRepo.findAllUsersWithAffinity as any).mockClear();
  (mockAffinityRepo.findCandidateNeighbors as any).mockClear();
  (mockSimilarityRepo.save as any).mockClear();

  it('should process users and save neighbors', async () => {
    // 1. Mock finding users
    (mockAffinityRepo.findAllUsersWithAffinity as any).mockResolvedValueOnce([
      'u1',
    ]);

    // 2. Mock finding candidates for u1
    // Return u2 and u3 as candidates (IDs)
    (mockAffinityRepo.findCandidateNeighbors as any).mockResolvedValueOnce([
      'u2',
      'u3',
    ]);

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
    expect(mockAffinityRepo.findAllUsersWithAffinity).toHaveBeenCalledTimes(1);
    expect(mockAffinityRepo.findCandidateNeighbors).toHaveBeenCalledTimes(1);
    expect(mockAffinityRepo.findByUser).toHaveBeenCalledTimes(3); // u1, u2, u3
    expect(mockSimilarityRepo.save).toHaveBeenCalledTimes(2); // saved u2 and u3 (both mock calc returns 0.5 > 0)
  });

  it('should ignore users with no candidates', async () => {
    // Clear mocks manually for this test case isolation
    (mockAffinityRepo.findAllUsersWithAffinity as any).mockClear();
    (mockAffinityRepo.findCandidateNeighbors as any).mockClear();
    (mockAffinityRepo.findByUser as any).mockClear();
    (mockSimilarityRepo.save as any).mockClear();

    (mockAffinityRepo.findAllUsersWithAffinity as any).mockResolvedValueOnce([
      'u1',
    ]);

    // No candidates
    (mockAffinityRepo.findCandidateNeighbors as any).mockResolvedValueOnce([]);

    await service.execute();

    expect(mockAffinityRepo.findByUser).not.toHaveBeenCalled();
    expect(mockSimilarityRepo.save).not.toHaveBeenCalled();
  });
});
