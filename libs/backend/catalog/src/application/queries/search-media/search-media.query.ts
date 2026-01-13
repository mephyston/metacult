import { MediaType } from '../../../domain/entities/media.entity';

/**
 * Objet Query encapsulant les critères de recherche utilisateur.
 * Immuable.
 */
export class SearchMediaQuery {
  constructor(
    public readonly search?: string,
    public readonly type?: MediaType,
    public readonly types?: MediaType[], // New: Filter by multiple types
    public readonly tag?: string,
    public readonly excludedIds?: string[],
    public readonly limit?: number,
    public readonly orderBy?: 'random' | 'recent' | 'popularity',
    public readonly releaseYear?: number,
    public readonly minElo?: number,
    public readonly tags?: string[], // Array of tags
    public readonly page?: number,
  ) {}
}
