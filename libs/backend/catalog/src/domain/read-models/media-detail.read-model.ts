import { MediaType } from '../entities/media.entity';

export interface MediaDetailReadModel {
  id: string;
  slug: string;
  title: string;
  type: MediaType;
  eloScore?: number;
  matchCount?: number;
  releaseYear: number | null;
  posterUrl: string | null;
  rating: number | null;
  description: string | null;
  tags: { id: string; label: string; slug: string }[];
  metadata: Record<string, any>;
}
