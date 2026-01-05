import { describe, it, expect, mock, beforeEach, afterAll } from 'bun:test';
import { Job } from 'bullmq';
import {
  rankingProcessorDeps,
  processRankingUpdate,
} from './ranking.processor';

// --- Mocks ---
const mockExecute = mock(() => Promise.resolve());

describe('Ranking Processor', () => {
  // Save original handler to restore after tests
  const originalHandler = rankingProcessorDeps.handler;

  beforeEach(() => {
    mockExecute.mockClear();
    // Inject Mock
    rankingProcessorDeps.handler = { execute: mockExecute } as any;
  });

  afterAll(() => {
    // Restore Original
    rankingProcessorDeps.handler = originalHandler;
  });

  it('should delegate to UpdateEloScoreHandler with correct command', async () => {
    const job = {
      data: { winnerId: 'win-1', loserId: 'loss-1' },
    } as unknown as Job;

    await processRankingUpdate(job);

    // Verify Handler was called with correct command
    expect(mockExecute).toHaveBeenCalledTimes(1);
    expect(mockExecute).toHaveBeenCalledWith(
      expect.objectContaining({ winnerId: 'win-1', loserId: 'loss-1' }),
    );
  });
});
