import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { UpdateEloScoreHandler } from './update-elo-score.handler';
import { UpdateEloScoreCommand } from './update-elo-score.command';
import { MediaNotFoundError } from '../../domain/errors/ranking.errors';
import type { DuelRepository } from '../ports/duel.repository.interface';
import type { EloCalculator } from '../../domain/services/elo-calculator.service';

describe('UpdateEloScoreHandler', () => {
  let handler: UpdateEloScoreHandler;
  let mockDuelRepository: DuelRepository;
  let mockEloCalculator: EloCalculator;

  const mockWinner = {
    id: 'win-1',
    title: 'Winner',
    eloScore: 1000,
    matchCount: 10,
  } as any;

  const mockLoser = {
    id: 'loss-1',
    title: 'Loser',
    eloScore: 1000,
    matchCount: 10,
  } as any;

  beforeEach(() => {
    // Mock Repository
    mockDuelRepository = {
      findById: mock(async (id: string) => {
        if (id === 'win-1') return mockWinner;
        if (id === 'loss-1') return mockLoser;
        return undefined;
      }),
      updateEloScores: mock(async () => void 0),
      getRandomPairForUser: mock(async () => []),
    };

    // Mock Elo Calculator
    mockEloCalculator = {
      calculateNewScores: mock(() => ({
        winnerNewElo: 1016,
        loserNewElo: 984,
      })),
    } as unknown as EloCalculator;

    handler = new UpdateEloScoreHandler(mockDuelRepository, mockEloCalculator);
  });

  it('should update scores successfully when both media exist', async () => {
    const command = new UpdateEloScoreCommand('win-1', 'loss-1');

    const result = await handler.execute(command);

    expect(result.isSuccess()).toBe(true);

    // Verify Fetch
    expect(mockDuelRepository.findById).toHaveBeenCalledWith('win-1');
    expect(mockDuelRepository.findById).toHaveBeenCalledWith('loss-1');

    // Verify Calculation
    expect(mockEloCalculator.calculateNewScores).toHaveBeenCalledWith(
      1000,
      1000,
    );

    // Verify Update
    expect(mockDuelRepository.updateEloScores).toHaveBeenCalledWith(
      'win-1',
      1016,
      'loss-1',
      984,
    );
  });

  it('should return MediaNotFoundError if winner is missing', async () => {
    mockDuelRepository.findById = mock(async (id) =>
      id === 'loss-1' ? mockLoser : undefined,
    );

    handler = new UpdateEloScoreHandler(mockDuelRepository, mockEloCalculator);
    const command = new UpdateEloScoreCommand('missing', 'loss-1');

    const result = await handler.execute(command);

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toBeInstanceOf(MediaNotFoundError);
  });

  it('should return MediaNotFoundError if loser is missing', async () => {
    mockDuelRepository.findById = mock(async (id) =>
      id === 'win-1' ? mockWinner : undefined,
    );

    handler = new UpdateEloScoreHandler(mockDuelRepository, mockEloCalculator);
    const command = new UpdateEloScoreCommand('win-1', 'missing');

    const result = await handler.execute(command);

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toBeInstanceOf(MediaNotFoundError);
  });
});
