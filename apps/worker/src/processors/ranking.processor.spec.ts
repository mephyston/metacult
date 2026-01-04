import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { Job } from 'bullmq';

// --- Mocks ---

// 1. Data Fixtures
const MOCK_WINNER = {
  id: 'win-1',
  title: 'Winner',
  eloScore: 1500,
  matchCount: 0,
};
const MOCK_LOSER = {
  id: 'loss-1',
  title: 'Loser',
  eloScore: 1500,
  matchCount: 0,
};

// 2. Transasction Spies
const mockUpdateSet = mock(() => ({ where: mock(() => Promise.resolve()) }));
const mockTx = {
  update: () => ({ set: mockUpdateSet }),
};

// 3. Select Spies
// We capture the "ID" passed to eq() to return the correct user
const mockSelectWhere = mock((condition: any) => {
  // Condition comes from our mocked 'eq' function below: { col:..., val: 'win-1' }
  const targetId = condition?.val;

  let result: any[] = [];
  if (targetId === 'win-1') result = [MOCK_WINNER];
  if (targetId === 'loss-1') result = [MOCK_LOSER];

  return {
    limit: () => ({
      then: (cb: any) => cb(result),
    }),
  };
});

// 4. Mock Modules
mock.module('drizzle-orm', () => ({
  eq: (col: any, val: any) => ({ col, val }), // Capture value for inspection
}));

mock.module('@metacult/backend-infrastructure', () => ({
  getDbConnection: () => ({
    db: {
      select: () => ({ from: () => ({ where: mockSelectWhere }) }),
      transaction: async (cb: any) => cb(mockTx),
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
      if (key === 'BETTER_AUTH_URL') return 'http://localhost:3000';
      if (key === 'PUBLIC_API_URL') return 'http://localhost:3000';
      return 'mock-value';
    },
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
    isTest: true,
  },
}));

// We use the REAL EloCalculator/RankingQueue constants to avoid test pollution
// (The mock above was leaking into elo-calculator.service.spec.ts)

// Import System Under Test (SUT)
import { processRankingUpdate } from './ranking.processor';

describe('Ranking Processor', () => {
  beforeEach(() => {
    mockUpdateSet.mockClear();
    mockSelectWhere.mockClear();
  });

  it('should calculate scores and update both medias in a transaction', async () => {
    const job = {
      data: { winnerId: 'win-1', loserId: 'loss-1' },
    } as unknown as Job;

    await processRankingUpdate(job);

    // 1. Verify Fetch
    expect(mockSelectWhere).toHaveBeenCalledTimes(2);

    // 2. Verify Update calls
    expect(mockUpdateSet).toHaveBeenCalledTimes(2);

    // Winner Update
    const calls = mockUpdateSet.mock.calls as any[];
    const firstCallArg = calls[0] ? calls[0][0] : undefined;
    expect(firstCallArg).toEqual({ eloScore: 1516, matchCount: 1 });

    // Loser Update
    const secondCallArg = calls[1] ? calls[1][0] : undefined;
    expect(secondCallArg).toEqual({ eloScore: 1484, matchCount: 1 });
  });
});
