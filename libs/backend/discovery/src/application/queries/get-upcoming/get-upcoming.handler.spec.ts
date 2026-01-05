import { describe, it, expect, mock } from 'bun:test';
import { GetUpcomingHandler } from './get-upcoming.handler';
import { GetUpcomingQuery } from './get-upcoming.query';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';

describe('GetUpcomingHandler', () => {
  const mockRepo: CatalogRepository = {
    findTrending: mock(),
    findHallOfFame: mock(),
    findControversial: mock(),
    findUpcoming: mock(() => Promise.resolve([])),
    findTopRatedByYear: mock(),
  } as any;

  const handler = new GetUpcomingHandler(mockRepo);

  it('should call repository with correct parameters', async () => {
    const query = new GetUpcomingQuery(20, 'BOOK');
    await handler.execute(query);

    expect(mockRepo.findUpcoming).toHaveBeenCalledWith(20, 'BOOK');
  });
});
