import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetTrendingQuery } from './get-trending.query';
import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

export class GetTrendingHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetTrendingQuery): Promise<Result<Media[], AppError>> {
    try {
      const res = await this.catalogRepository.findTrending(
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
