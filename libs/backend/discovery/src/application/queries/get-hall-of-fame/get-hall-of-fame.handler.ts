import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetHallOfFameQuery } from './get-hall-of-fame.query';

export class GetHallOfFameHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetHallOfFameQuery): Promise<Media[]> {
    return this.catalogRepository.findHallOfFame(query.limit, query.type);
  }
}
