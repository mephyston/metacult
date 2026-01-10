import { describe, it, expect, mock } from 'bun:test';
import { GetRecentMediaHandler } from './get-recent-media.handler';

describe('GetRecentMediaHandler', () => {
  it('should return cached data if available', async () => {
    const mockRepo = { findMostRecent: mock() } as any;
    const mockRedis = {
      get: mock(() =>
        Promise.resolve(JSON.stringify([{ id: '1', title: 'Cached' }])),
      ),
      set: mock(),
    } as any;

    const handler = new GetRecentMediaHandler(mockRepo, mockRedis);
    const result = await handler.execute({ limit: 10 });

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(result.getValue()![0]!.title).toBe('Cached');
    expect(mockRedis.get).toHaveBeenCalled();
    expect(mockRepo.findMostRecent).not.toHaveBeenCalled();
  });

  it('should fetch from repo on cache miss', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'New',
        releaseYear: 2023,
        type: 'MOVIE',
        coverUrl: 'url',
        tags: [],
      },
    ];
    const mockRepo = {
      findMostRecent: mock(() => Promise.resolve(mockResults)),
    } as any;
    const mockRedis = {
      get: mock(() => Promise.resolve(null)),
      set: mock(() => Promise.resolve('OK')),
    } as any;

    const handler = new GetRecentMediaHandler(mockRepo, mockRedis);
    const result = await handler.execute({ limit: 10 });

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toHaveLength(1);
    expect(result.getValue()![0]!.title).toBe('New');
    expect(mockRepo.findMostRecent).toHaveBeenCalledWith(10);
    expect(mockRedis.set).toHaveBeenCalled();
  });
});
