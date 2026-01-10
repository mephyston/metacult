import { describe, it, expect } from 'vitest';
import { getCurrentCatalogYear } from './date.utils';

describe('getCurrentCatalogYear', () => {
  describe('before March 1st (returns N-1)', () => {
    it('should return previous year on January 1st', () => {
      const jan1 = new Date(2025, 0, 1); // January 1, 2025
      expect(getCurrentCatalogYear(jan1)).toBe(2024);
    });

    it('should return previous year on February 28th', () => {
      const feb28 = new Date(2025, 1, 28); // February 28, 2025
      expect(getCurrentCatalogYear(feb28)).toBe(2024);
    });

    it('should return previous year on February 29th (leap year)', () => {
      const feb29 = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      expect(getCurrentCatalogYear(feb29)).toBe(2023);
    });
  });

  describe('from March 1st onwards (returns N)', () => {
    it('should return current year on March 1st', () => {
      const mar1 = new Date(2025, 2, 1); // March 1, 2025
      expect(getCurrentCatalogYear(mar1)).toBe(2025);
    });

    it('should return current year on March 2nd', () => {
      const mar2 = new Date(2025, 2, 2); // March 2, 2025
      expect(getCurrentCatalogYear(mar2)).toBe(2025);
    });

    it('should return current year on December 31st', () => {
      const dec31 = new Date(2025, 11, 31); // December 31, 2025
      expect(getCurrentCatalogYear(dec31)).toBe(2025);
    });

    it('should return current year in the middle of the year', () => {
      const jul15 = new Date(2025, 6, 15); // July 15, 2025
      expect(getCurrentCatalogYear(jul15)).toBe(2025);
    });
  });

  describe('edge cases', () => {
    it('should use current date when no argument provided', () => {
      const result = getCurrentCatalogYear();
      const now = new Date();
      const expectedYear =
        now.getMonth() < 2 ? now.getFullYear() - 1 : now.getFullYear();
      expect(result).toBe(expectedYear);
    });
  });
});
