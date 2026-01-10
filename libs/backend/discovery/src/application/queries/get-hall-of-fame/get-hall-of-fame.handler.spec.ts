import { describe, it, expect, mock } from 'bun:test';
import { GetHallOfFameHandler } from './get-hall-of-fame.handler';
import { GetHallOfFameQuery } from './get-hall-of-fame.query';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';

describe('GetHallOfFameHandler', () => {
  const mockRepo: CatalogRepository = {
    findTrending: mock(),
    findHallOfFame: mock(() => Promise.resolve([])),
    findControversial: mock(),
    findUpcoming: mock(),
    findTopRatedByYear: mock(),
  } as any;

  const handler = new GetHallOfFameHandler(mockRepo);

  it('should call repository with correct parameters', async () => {
    const query = new GetHallOfFameQuery(20, 'MOVIE');
    const result = await handler.execute(query);
    expect(result.isSuccess()).toBe(true);

    expect(mockRepo.findHallOfFame).toHaveBeenCalledWith(20, 'MOVIE');
  });
});
