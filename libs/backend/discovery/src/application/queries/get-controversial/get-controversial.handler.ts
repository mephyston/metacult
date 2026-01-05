import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetControversialQuery } from './get-controversial.query';

export class GetControversialHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetControversialQuery): Promise<Media[]> {
    return this.catalogRepository.findControversial(query.limit, query.type);
  }
}
