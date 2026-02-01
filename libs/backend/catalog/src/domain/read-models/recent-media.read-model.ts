import { MediaType } from '../entities/media.entity';

export interface RecentMediaReadModel {
  id: string;
  title: string;
  releaseYear: number | null;
  type: MediaType;
  posterUrl: string | null;
  tags: string[];
}
