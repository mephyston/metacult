import { describe, it, expect } from 'bun:test';
import { ReleaseYear } from './release-year.vo';

describe('ReleaseYear VO', () => {
  const currentYear = new Date().getFullYear();

  describe('Validation', () => {
    it('should accept valid years', () => {
      expect(() => new ReleaseYear(2000)).not.toThrow();
      expect(() => new ReleaseYear(currentYear)).not.toThrow();
      expect(() => new ReleaseYear(1980)).not.toThrow();
    });

    it('should reject year < 1800', () => {
      expect(() => new ReleaseYear(1799)).toThrow();
    });

    it('should accept future years', () => {
      expect(() => new ReleaseYear(currentYear + 10)).not.toThrow();
    });
  });
});
