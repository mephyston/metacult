import { Media } from '@metacult/backend-catalog';

export interface CatalogRepository {
  findTrending(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]>;
  findHallOfFame(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]>;
  findControversial(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]>;
  findUpcoming(
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]>;
  findTopRatedByYear(
    year: number,
    limit: number,
    type?: 'GAME' | 'MOVIE' | 'SHOW' | 'BOOK',
  ): Promise<Media[]>;
  findByIds(ids: string[]): Promise<Media[]>;
}
