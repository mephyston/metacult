import { describe, it, expect, mock } from 'bun:test';
import { GetTrendingHandler } from './get-trending.handler';
import { GetTrendingQuery } from './get-trending.query';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';

describe('GetTrendingHandler', () => {
  const mockRepo: CatalogRepository = {
    findTrending: mock(() => Promise.resolve([])),
    findHallOfFame: mock(),
    findControversial: mock(),
    findUpcoming: mock(),
    findTopRatedByYear: mock(),
  } as any;

  const handler = new GetTrendingHandler(mockRepo);

  it('should call repository with correct parameters', async () => {
    const query = new GetTrendingQuery(20, 'GAME');
    await handler.execute(query);

    expect(mockRepo.findTrending).toHaveBeenCalledWith(20, 'GAME');
  });

  it('should handle missing optional parameters', async () => {
    const query = new GetTrendingQuery();
    await handler.execute(query);

    expect(mockRepo.findTrending).toHaveBeenCalledWith(10, undefined);
  });
});
