import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetUpcomingQuery } from './get-upcoming.query';
import { Result, AppError, InfrastructureError } from '@metacult/shared-core';

export class GetUpcomingHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetUpcomingQuery): Promise<Result<Media[], AppError>> {
    try {
      const res = await this.catalogRepository.findUpcoming(
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
