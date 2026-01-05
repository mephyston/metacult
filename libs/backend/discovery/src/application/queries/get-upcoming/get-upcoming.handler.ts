import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetUpcomingQuery } from './get-upcoming.query';

export class GetUpcomingHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetUpcomingQuery): Promise<Media[]> {
    return this.catalogRepository.findUpcoming(query.limit, query.type);
  }
}
