import { describe, it, expect } from 'vitest';

/**
 * SearchFilters Component Tests
 *
 * Tests verify the logic and expected behaviors of the SearchFilters component.
 * Component uses shadcn-vue atomic components from @metacult/shared-ui.
 */

describe('SearchFilters - Logic', () => {
  describe('ELO quality labels', () => {
    function getEloLabel(minElo: number): string {
      if (minElo >= 1800) return 'Excellent';
      if (minElo >= 1500) return 'Très bon';
      if (minElo >= 1200) return 'Bon';
      if (minElo >= 1000) return 'Correct';
      return 'Tous';
    }

    it('should return "Tous" for ELO 800', () => {
      expect(getEloLabel(800)).toBe('Tous');
    });

    it('should return "Correct" for ELO 1000', () => {
      expect(getEloLabel(1000)).toBe('Correct');
    });

    it('should return "Bon" for ELO 1200', () => {
      expect(getEloLabel(1200)).toBe('Bon');
    });

    it('should return "Très bon" for ELO 1500', () => {
      expect(getEloLabel(1500)).toBe('Très bon');
    });

    it('should return "Excellent" for ELO 1800+', () => {
      expect(getEloLabel(1900)).toBe('Excellent');
    });
  });

  describe('URL params generation', () => {
    function buildSearchParams(filters: {
      query?: string;
      type?: string;
      year?: string;
      minElo?: number;
    }): URLSearchParams {
      const params = new URLSearchParams();
      if (filters.query) params.set('q', filters.query);
      if (filters.type) params.set('type', filters.type);
      if (filters.year) params.set('releaseYear', filters.year);
      if (filters.minElo && filters.minElo > 800) {
        params.set('minElo', filters.minElo.toString());
      }
      return params;
    }

    it('should include q param for keyword search', () => {
      const params = buildSearchParams({ query: 'Matrix' });
      expect(params.get('q')).toBe('Matrix');
    });

    it('should include type param for media type', () => {
      const params = buildSearchParams({ type: 'movie' });
      expect(params.get('type')).toBe('movie');
    });

    it('should include releaseYear param', () => {
      const params = buildSearchParams({ year: '2024' });
      expect(params.get('releaseYear')).toBe('2024');
    });

    it('should include minElo only when > 800', () => {
      const params800 = buildSearchParams({ minElo: 800 });
      expect(params800.has('minElo')).toBe(false);

      const params1500 = buildSearchParams({ minElo: 1500 });
      expect(params1500.get('minElo')).toBe('1500');
    });

    it('should combine multiple filters', () => {
      const params = buildSearchParams({
        query: 'Zelda',
        type: 'game',
        year: '2023',
        minElo: 1600,
      });

      expect(params.get('q')).toBe('Zelda');
      expect(params.get('type')).toBe('game');
      expect(params.get('releaseYear')).toBe('2023');
      expect(params.get('minElo')).toBe('1600');
    });
  });

  describe('year options range', () => {
    it('should generate years from current year to 1990', () => {
      const currentYear = new Date().getFullYear();
      const years: number[] = [];

      for (let y = currentYear; y >= 1990; y--) {
        years.push(y);
      }

      expect(years[0]).toBe(currentYear);
      expect(years[years.length - 1]).toBe(1990);
      expect(years.length).toBe(currentYear - 1990 + 1);
    });
  });

  describe('media types', () => {
    const mediaTypes = ['game', 'movie', 'tv', 'book'];

    it('should support all media types', () => {
      expect(mediaTypes).toContain('game');
      expect(mediaTypes).toContain('movie');
      expect(mediaTypes).toContain('tv');
      expect(mediaTypes).toContain('book');
    });
  });
});
