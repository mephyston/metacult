import { describe, it, expect } from 'bun:test';
import { EloCalculator } from './elo-calculator.service';

describe('Elo Calculator Service', () => {
    const calculator = new EloCalculator();

    it('should calculate correct score for equal opponents (Standard Win)', () => {
        // A (1500) vs B (1500). A wins.
        // Expected = 0.5
        // A: 1500 + 32 * (1 - 0.5) = 1516
        // B: 1500 + 32 * (0 - 0.5) = 1484
        const result = calculator.calculateNewScores(1500, 1500);

        expect(result.winnerNewElo).toBe(1516);
        expect(result.loserNewElo).toBe(1484);
    });

    it('should grant less points when high elo beats low elo (Expected Win)', () => {
        // A (2000) vs B (1000). A wins.
        // Expected A ~ 1
        // Gain should be minimal
        const result = calculator.calculateNewScores(2000, 1000);

        expect(result.winnerNewElo).toBeGreaterThanOrEqual(2000); // Peut gagner 0 ou 1 point
        expect(result.winnerNewElo).toBeLessThan(2005); // Pas + de 5 points
    });

    it('should grant massive points when low elo beats high elo (Upset)', () => {
        // A (1000) vs B (2000). A wins.
        // Expected A ~ 0
        // Gain should be close to K-Factor (32)
        const result = calculator.calculateNewScores(1000, 2000);

        expect(result.winnerNewElo).toBeGreaterThan(1030); // ~ 1032
        expect(result.loserNewElo).toBeLessThan(1970); // ~ 1968
    });
});
