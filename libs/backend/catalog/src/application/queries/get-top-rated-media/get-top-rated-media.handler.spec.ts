import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { GetTopRatedMediaHandler } from './get-top-rated-media.handler';
import type { MediaReadDto } from '../search-media/media-read.dto';

describe('GetTopRatedMediaHandler', () => {
  let handler: GetTopRatedMediaHandler;
  let mockRepo: any;
  let mockRedis: any;

  beforeEach(() => {
    mockRepo = {
      findTopRated: mock(() => Promise.resolve([])),
    };
    mockRedis = {
      get: mock(() => Promise.resolve(null)),
      set: mock(() => Promise.resolve('OK')),
    };

    handler = new GetTopRatedMediaHandler(mockRepo, mockRedis);
  });

  it('should return trends from cache if available', async () => {
    const cachedTrends: MediaReadDto[] = [
      {
        id: 'cached-1',
        slug: 'cached-game',
        title: 'Cached Game',
        type: 'game',
        coverUrl: 'http://img.com/cover.jpg',
        rating: 9.5,
        releaseYear: 2023,
        description: 'A cached game',
        isImported: true,
        eloScore: 1800,
      },
    ];

    mockRedis.get.mockResolvedValue(JSON.stringify(cachedTrends));

    const result = await handler.execute({ limit: 5 });

    expect(mockRedis.get).toHaveBeenCalledWith('catalog:top-rated:limit:5');
    expect(mockRepo.findTopRated).not.toHaveBeenCalled(); // Should NOT query DB
    expect(result).toEqual(cachedTrends);
  });

  it('should fetch from DB and cache on cache miss', async () => {
    const dbTrends: MediaReadDto[] = [
      {
        id: 'db-1',
        slug: 'top-game',
        title: 'Top Game',
        type: 'game',
        coverUrl: 'http://img.com/top.jpg',
        rating: 9.8,
        releaseYear: 2024,
        description: null,
        isImported: true,
        eloScore: 2000,
      },
      {
        id: 'db-2',
        slug: 'second-game',
        title: 'Second Game',
        type: 'game',
        coverUrl: 'http://img.com/second.jpg',
        rating: 9.2,
        releaseYear: 2023,
        description: null,
        isImported: true,
        eloScore: 1900,
      },
    ];

    mockRedis.get.mockResolvedValue(null); // Cache miss
    mockRepo.findTopRated.mockResolvedValue(dbTrends);

    const result = await handler.execute({ limit: 5 });

    expect(mockRedis.get).toHaveBeenCalledWith('catalog:top-rated:limit:5');
    expect(mockRepo.findTopRated).toHaveBeenCalledWith(5);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'catalog:top-rated:limit:5',
      JSON.stringify(dbTrends),
      'EX',
      300,
    );
    expect(result).toEqual(dbTrends);
  });

  it('should include eloScore field in results', async () => {
    const trendsWithElo: MediaReadDto[] = [
      {
        id: 'elo-1',
        slug: 'high-elo-game',
        title: 'High ELO Game',
        type: 'game',
        coverUrl: 'http://img.com/elo.jpg',
        rating: null,
        releaseYear: 2024,
        description: null,
        isImported: true,
        eloScore: 2100, // HIGH ELO
      },
      {
        id: 'elo-2',
        slug: 'medium-elo-game',
        title: 'Medium ELO Game',
        type: 'movie',
        coverUrl: null,
        rating: 8.5,
        releaseYear: 2022,
        description: null,
        isImported: true,
        eloScore: 1650, // MEDIUM ELO
      },
    ];

    mockRedis.get.mockResolvedValue(null);
    mockRepo.findTopRated.mockResolvedValue(trendsWithElo);

    const result = await handler.execute({ limit: 10 });

    expect(result).toHaveLength(2);
    expect(result[0]?.eloScore).toBe(2100);
    expect(result[1]?.eloScore).toBe(1650);
    expect(result.every((item) => 'eloScore' in item)).toBe(true);
  });

  it('should respect limit parameter', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRepo.findTopRated.mockResolvedValue([]);

    await handler.execute({ limit: 3 });

    expect(mockRepo.findTopRated).toHaveBeenCalledWith(3);
    expect(mockRedis.set).toHaveBeenCalledWith(
      'catalog:top-rated:limit:3',
      expect.any(String),
      'EX',
      300,
    );
  });

  it('should return empty array if no trends available', async () => {
    mockRedis.get.mockResolvedValue(null);
    mockRepo.findTopRated.mockResolvedValue([]);

    const result = await handler.execute({ limit: 5 });

    expect(result).toEqual([]);
    expect(mockRedis.set).toHaveBeenCalled(); // Should still cache empty result
  });
});
