import { describe, expect, it } from 'bun:test';
import { PersonalAffinityService } from './personal-affinity.service';

describe('PersonalAffinityService', () => {
  describe('initialize', () => {
    it('should add 400 for BANGER', () => {
      expect(PersonalAffinityService.initialize(1200, 'BANGER')).toBe(1600);
    });

    it('should add 200 for GOOD', () => {
      expect(PersonalAffinityService.initialize(1200, 'GOOD')).toBe(1400);
    });

    it('should add 0 for OKAY', () => {
      expect(PersonalAffinityService.initialize(1200, 'OKAY')).toBe(1200);
    });

    it('should force 800 for DISLIKE', () => {
      expect(PersonalAffinityService.initialize(1500, 'DISLIKE')).toBe(800);
      expect(PersonalAffinityService.initialize(1000, 'DISLIKE')).toBe(800);
    });
  });

  describe('updateAfterDuel', () => {
    it('should correctly calculate new scores for a standard win', () => {
      // Equal scores (1200 vs 1200), K=80
      // Expected score for both is 0.5
      // Winner gains 80 * (1 - 0.5) = 40
      // Loser loses 80 * (0 - 0.5) = -40
      const { winnerNewScore, loserNewScore } =
        PersonalAffinityService.updateAfterDuel(1200, 1200);
      expect(winnerNewScore).toBe(1240);
      expect(loserNewScore).toBe(1160);
    });

    it('should gain less points for beating a much lower rated opponent', () => {
      // 1600 vs 1200
      // Expected winner: 1 / (1 + 10^((1200-1600)/400)) = 1 / (1 + 10^-1) = 1 / 1.1 = ~0.909
      // Winner gains 80 * (1 - 0.909) ~= 7.2 -> 7
      // Loser loses 80 * (0 - 0.09) ~= -7.2 -> -7
      const { winnerNewScore, loserNewScore } =
        PersonalAffinityService.updateAfterDuel(1600, 1200);
      expect(winnerNewScore).toBeLessThan(1640);
      expect(winnerNewScore).toBeGreaterThan(1600);
      expect(loserNewScore).toBeLessThan(1200);
    });

    it('should gain massive points for beating a much higher rated opponent (upset)', () => {
      // 1200 vs 1600
      // Expected winner (underdog): ~0.09
      // Winner gains 80 * (1 - 0.09) ~= 72.8 --> 73
      const { winnerNewScore, loserNewScore } =
        PersonalAffinityService.updateAfterDuel(1200, 1600);
      expect(winnerNewScore).toBeGreaterThan(1250);
      expect(loserNewScore).toBeLessThan(1550);
    });
  });
});
