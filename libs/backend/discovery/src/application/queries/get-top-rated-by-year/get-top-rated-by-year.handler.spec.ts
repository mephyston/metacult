import { describe, it, expect, mock } from 'bun:test';
import { GetTopRatedByYearHandler } from './get-top-rated-by-year.handler';
import { GetTopRatedByYearQuery } from './get-top-rated-by-year.query';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';

describe('GetTopRatedByYearHandler', () => {
  const mockRepo: CatalogRepository = {
    findTrending: mock(),
    findHallOfFame: mock(),
    findControversial: mock(),
    findUpcoming: mock(),
    findTopRatedByYear: mock(() => Promise.resolve([])),
  } as any;

  const handler = new GetTopRatedByYearHandler(mockRepo);

  it('should call repository with correct parameters', async () => {
    const query = new GetTopRatedByYearQuery(2023, 15, 'MOVIE');
    const result = await handler.execute(query);
    expect(result.isSuccess()).toBe(true);

    expect(mockRepo.findTopRatedByYear).toHaveBeenCalledWith(2023, 15, 'MOVIE');
  });
});
