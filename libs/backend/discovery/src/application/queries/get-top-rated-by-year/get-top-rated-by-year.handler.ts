import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetTopRatedByYearQuery } from './get-top-rated-by-year.query';
import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

export class GetTopRatedByYearHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetTopRatedByYearQuery): Promise<Result<Media[]>> {
    try {
      const res = await this.catalogRepository.findTopRatedByYear(
        query.year,
        query.limit,
        query.type,
      );
      return Result.ok(res);
    } catch (error) {
      return Result.fail(
        error instanceof AppError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }
}
