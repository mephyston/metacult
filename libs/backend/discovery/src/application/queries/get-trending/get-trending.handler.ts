import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetTrendingQuery } from './get-trending.query';

export class GetTrendingHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetTrendingQuery): Promise<Media[]> {
    return this.catalogRepository.findTrending(query.limit, query.type);
  }
}
