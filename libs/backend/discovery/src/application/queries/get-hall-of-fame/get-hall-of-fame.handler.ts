import { Media } from '@metacult/backend-catalog';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';
import { GetHallOfFameQuery } from './get-hall-of-fame.query';
import { Result, InfrastructureError } from '@metacult/shared-core';

export class GetHallOfFameHandler {
  constructor(private readonly catalogRepository: CatalogRepository) {}

  async execute(query: GetHallOfFameQuery): Promise<Result<Media[]>> {
    try {
      const res = await this.catalogRepository.findHallOfFame(
        query.limit,
        query.type,
      );
      return Result.ok(res);
    } catch (error) {
      return Result.fail(
        error instanceof InfrastructureError
          ? error
          : new InfrastructureError(
              error instanceof Error ? error.message : 'Unknown error',
            ),
      );
    }
  }
}
