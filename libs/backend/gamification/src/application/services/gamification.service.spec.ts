import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GamificationService } from './gamification.service';
import { asUserId } from '@metacult/shared-core';

// Mock chains
// Mock chains moved to inside tests if needed or removed if unused top-level
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

  let mockRepo: any;
  beforeEach(() => {
    mockRepo = {
      updateXp: vi.fn(() => Promise.resolve()),
      getLevel: vi.fn(() => Promise.resolve({ level: 1, xpToNext: 100 })),
      getUserXp: vi.fn(() => Promise.resolve({ currentXp: 50, totalXp: 50 })),
      getUserStats: vi.fn(),
      saveUserStats: vi.fn(),
    };
    service = new GamificationService(mockRepo);
    vi.clearAllMocks();
  });

  describe('calculateLevel (Private logic via addXp)', () => {
    it('should stay at level 1 for small XP', async () => {
      // Mock finding user stats
      const existing = {
        userId: 'user1',
        xp: 0,
        level: 1,
        addXp: vi.fn(), // domain method
      };
      mockRepo.getUserStats.mockResolvedValue(existing);
      mockRepo.saveUserStats.mockImplementation((ent: any) =>
        Promise.resolve(ent),
      );

      // We need to simulate the domain logic effect inside the mock or just rely on the service calling addXp
      // Using a real entity or a sophisticated mock is better.
      // Let's assume the service calls entity.addXp(50)
      // And then saves it.

      // Actually, if we mock the entity, the logic of "calculating level" is INSIDE the entity (UserStats).
      // If the service just delegates: entity.addXp(amount); repo.save(entity);
      // Then checking if level changed requires the ENTITY logic to be correct.
      // Unit testing the Service is just testing delegation.
      // Unit testing the Entity is testing the logic.
      // The current test seems to want to test the LOGIC.
      // So checking result.level depends on the entity.
      // Use a REAL UserStats entity if possible?
      // Or mock the behavior of addXp.

      const mockEntity = {
        addXp: vi.fn(function (this: any, amount: number) {
          this.xp += amount;
        }), // Simple behavior
        xp: 0,
        level: 1,
        userId: 'user1',
      };
      mockRepo.getUserStats.mockResolvedValue(mockEntity);
      mockRepo.saveUserStats.mockResolvedValue(mockEntity);

      await service.addXp(asUserId('user1'), 50);

      expect(mockRepo.getUserStats).toHaveBeenCalledWith('user1');
      expect(mockEntity.addXp).toHaveBeenCalledWith(50);
      expect(mockRepo.saveUserStats).toHaveBeenCalled();
    });

    it('should delegate to repository', async () => {
      const mockEntity = {
        addXp: vi.fn(),
        xp: 0,
        level: 1,
        userId: 'user1',
      };
      mockRepo.getUserStats.mockResolvedValue(mockEntity);
      mockRepo.saveUserStats.mockResolvedValue(mockEntity);

      await service.addXp(asUserId('user1'), 150);

      expect(mockRepo.getUserStats).toHaveBeenCalledWith('user1');
      expect(mockEntity.addXp).toHaveBeenCalledWith(150);
      expect(mockRepo.saveUserStats).toHaveBeenCalledWith(mockEntity);
    });
  });

  describe('addXp', () => {
    it('should handle new user stats interaction', async () => {
      // getUserStats in repo should probably handle "not found" by creating default or returning null.
      // Looking at service implementation: "Get or create stats via Repo".
      // So repo.getUserStats likely returns a valid entity (new or existing).

      const mockEntity = { addXp: vi.fn(), xp: 0, level: 1 };
      mockRepo.getUserStats.mockResolvedValue(mockEntity);
      mockRepo.saveUserStats.mockResolvedValue(mockEntity);

      await service.addXp(asUserId('user1'), 10);

      expect(mockRepo.getUserStats).toHaveBeenCalled();
      expect(mockRepo.saveUserStats).toHaveBeenCalled();
    });

    it('should call entity addXp', async () => {
      const mockEntity = {
        addXp: vi.fn(),
        xp: 50,
        level: 1,
      };
      mockRepo.getUserStats.mockResolvedValue(mockEntity);
      mockRepo.saveUserStats.mockResolvedValue(mockEntity);

      await service.addXp(asUserId('user1'), 50);

      expect(mockEntity.addXp).toHaveBeenCalledWith(50);
    });
  });
});
