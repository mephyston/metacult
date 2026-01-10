import { describe, it, expect, mock } from 'bun:test';
import { GetControversialHandler } from './get-controversial.handler';
import { GetControversialQuery } from './get-controversial.query';
import type { CatalogRepository } from '../../../domain/ports/catalog.repository.interface';

describe('GetControversialHandler', () => {
  const mockRepo: CatalogRepository = {
    findTrending: mock(),
    findHallOfFame: mock(),
    findControversial: mock(() => Promise.resolve([])),
    findUpcoming: mock(),
    findTopRatedByYear: mock(),
  } as any;

  const handler = new GetControversialHandler(mockRepo);

  it('should call repository with correct parameters', async () => {
    const query = new GetControversialQuery(20, 'SHOW');
    const result = await handler.execute(query);
    expect(result.isSuccess()).toBe(true);

    expect(mockRepo.findControversial).toHaveBeenCalledWith(20, 'SHOW');
  });
});
