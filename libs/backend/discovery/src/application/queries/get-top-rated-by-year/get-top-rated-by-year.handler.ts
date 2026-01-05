import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetTopRatedByYearQuery } from './get-top-rated-by-year.query';

export class GetTopRatedByYearHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetTopRatedByYearQuery): Promise<Media[]> {
    return this.catalogRepository.findTopRatedByYear(
      query.year,
      query.limit,
      query.type,
    );
  }
}
