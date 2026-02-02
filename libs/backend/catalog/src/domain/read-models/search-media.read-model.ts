import { MediaType } from '../entities/media.entity';

export interface SearchMediaReadModel {
  id: string;
  title: string;
  slug: string | null;
  year: number | null;
  poster: string | null;
  type: MediaType;
  isImported: boolean;
  externalId: string | null;
}

export interface GroupedSearchResponse {
  games: SearchMediaReadModel[];
  movies: SearchMediaReadModel[];
  shows: SearchMediaReadModel[];
  books: SearchMediaReadModel[];
}

export interface PaginatedSearchResponse {
  items: SearchMediaReadModel[];
  total: number;
  page: number;
  totalPages: number;
}
