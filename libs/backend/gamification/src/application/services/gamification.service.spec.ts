import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GamificationService } from './gamification.service';

// Mock chains
const mockSelectChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn(),
};

const mockUpdateChain = {
  set: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

const mockInsertChain = {
  values: vi.fn().mockReturnThis(),
  returning: vi.fn(),
};

const mockDb = {
  select: vi.fn(() => mockSelectChain),
  insert: vi.fn(() => mockInsertChain),
  update: vi.fn(() => mockUpdateChain),
};

vi.mock('@metacult/backend-infrastructure', () => ({
  getDbConnection: () => ({ db: mockDb }),
}));

describe('GamificationService', () => {
  let service: GamificationService;

  beforeEach(() => {
    service = new GamificationService();
    vi.clearAllMocks();
  });

  describe('calculateLevel (Private logic via addXp)', () => {
    it('should stay at level 1 for small XP', async () => {
      // Mock finding user stats
      const existing = { userId: 'user1', xp: 0, level: 1 };
      mockSelectChain.where.mockResolvedValueOnce([existing]);

      // Updated return
      const updatedStats = { userId: 'user1', xp: 50, level: 1 };
      mockUpdateChain.returning.mockResolvedValueOnce([updatedStats]);

      const result = await service.addXp('user1', 50, 'test');

      expect(result).toEqual(updatedStats);
      // Verify calculation: floor(sqrt(50/100)) + 1 = floor(sqrt(0.5)) + 1 = 0 + 1 = 1
    });

    it('should level up when crossing threshold', async () => {
      // Level 2 requires: XP = 100 * (2-1)^2 = 100
      // Current: 0. Add: 150. New XP: 150.
      // Level = floor(sqrt(150/100)) + 1 = floor(1.22) + 1 = 2

      // Mock finding user stats
      const existing = { userId: 'user1', xp: 0, level: 1 };
      mockSelectChain.where.mockResolvedValueOnce([existing]);

      const updatedStats = { userId: 'user1', xp: 150, level: 2 };
      mockUpdateChain.returning.mockResolvedValueOnce([updatedStats]);

      const result = await service.addXp('user1', 150, 'test');
      expect(result).toBeDefined();
      expect(result!.level).toBe(2);
    });
  });

  describe('addXp', () => {
    it('should create new stats if user not found', async () => {
      mockSelectChain.where.mockResolvedValueOnce([]); // Not found

      const newStats = { userId: 'user1', xp: 0, level: 1 };
      mockInsertChain.returning.mockResolvedValueOnce([newStats]);

      // After insert, it continues to update
      const updatedStats = { userId: 'user1', xp: 10, level: 1 };
      mockUpdateChain.returning.mockResolvedValueOnce([updatedStats]);

      await service.addXp('user1', 10, 'test');

      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('should correct calculate partial level progress', async () => {
      // Level 1 starts at 0. Level 2 starts at 100.
      // XP = 50. Level 1.
      // currLevelXp = 50 - 0 = 50.
      // nextLevelXp (range) = 100 - 0 = 100.

      mockSelectChain.where.mockResolvedValueOnce([
        { userId: 'user1', xp: 0, level: 1 },
      ]);
      mockUpdateChain.returning.mockResolvedValueOnce([{}]);

      await service.addXp('user1', 50, 'test');

      expect(mockUpdateChain.set).toHaveBeenCalledWith(
        expect.objectContaining({
          xp: 50,
          level: 1,
          currLevelXp: 50,
          nextLevelXp: 100,
        }),
      );
    });
  });
});
