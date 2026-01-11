/**
 * Read Model for Media display.
 * Domain-level type for query results, independent of infrastructure.
 */
export interface MediaReadModel {
  id: string;
  slug: string;
  title: string;
  type: 'game' | 'movie' | 'tv' | 'book';
  coverUrl: string | null;
  rating: number | null;
  releaseYear: number | null;
  description: string | null;
  isImported: boolean;
  eloScore?: number;
}
