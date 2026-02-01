import { describe, expect, it, mock } from 'bun:test';
import { UpdateAffinityHandler } from './update-affinity.handler';
import type { AffinityRepository } from '../../domain/ports/affinity.repository.interface';
import type {
  SentimentUpdateCommand,
  DuelUpdateCommand,
} from './update-affinity.command';
import { Affinity } from '../../domain/entities/affinity.entity';

describe('UpdateAffinityHandler', () => {
  const mockRepository: AffinityRepository = {
    save: mock(() => Promise.resolve()),
    findByUserAndMedia: mock(() => Promise.resolve(null)),
    findByUser: mock(() => Promise.resolve([])), // Assuming it returns an array of affinities
    findAllUsersWithAffinity: mock(() => Promise.resolve([])),
    findCandidateNeighbors: mock(() => Promise.resolve([])),
  };

  // Mock DB
  const mockDb = {
    update: mock(() => mockDb),
    set: mock(() => mockDb),
    where: mock(() => mockDb),
    select: mock(() => mockDb),
    from: mock(() => mockDb),
    execute: mock(() => Promise.resolve([])),
  } as any;

  const handler = new UpdateAffinityHandler(mockRepository, mockDb);

  it('should handle SENTIMENT update by creating new affinity', async () => {
    const command: SentimentUpdateCommand = {
      type: 'SENTIMENT',
      userId: 'u1',
      mediaId: 'm1',
      sentiment: 'BANGER',
      globalElo: 1200,
    };

    // Mock finding nothing in Affinity Repo
    (mockRepository.findByUserAndMedia as any).mockResolvedValueOnce(null);

    // Mock DB returning Media Elo of 1200
    (mockDb.execute as any).mockResolvedValueOnce([{ eloScore: 1200 }]);

    await handler.execute(command);

    expect(mockRepository.save).toHaveBeenCalled();
    const savedArg = (mockRepository.save as any).mock.calls[0][0] as Affinity;
    expect(savedArg.userId).toBe('u1');
    expect(savedArg.mediaId).toBe('m1');
    expect(savedArg.score).toBe(1600); // 1200 + 400
  });

  it('should handle DUEL update by updating both affinities', async () => {
    const command: DuelUpdateCommand = {
      type: 'DUEL',
      userId: 'u1',
      winnerMediaId: 'w1',
      loserMediaId: 'l1',
      winnerGlobalElo: 1200,
      loserGlobalElo: 1200,
    };

    // Returns mocked existing affinities (Optional, here we test initialization fallback too if we return null)
    // Let's return null to test fallback initialization
    (mockRepository.findByUserAndMedia as any).mockResolvedValue(null);

    // Reset mocks
    (mockRepository.save as any).mockClear();

    await handler.execute(command);

    expect(mockRepository.save).toHaveBeenCalledTimes(2);

    // Because they started at 1200 ('OKAY'), winner should gain, loser should lose.
    // verify calls
    const calls = (mockRepository.save as any).mock.calls;
    const winnerArg = calls.find((c: any) => c[0].mediaId === 'w1')?.[0];
    const loserArg = calls.find((c: any) => c[0].mediaId === 'l1')?.[0];

    expect(winnerArg).toBeDefined();
    expect(loserArg).toBeDefined();

    expect(winnerArg.score).toBeGreaterThan(1200);
    expect(loserArg.score).toBeLessThan(1200);
  });
});
