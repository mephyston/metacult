import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { GetTopRatedMediaHandler } from './get-top-rated-media.handler';
import type { MediaReadModel } from '../../../domain/read-models/media-read.model';
import { MediaType } from '../../../domain/entities/media.entity';

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
    const cachedTrends: MediaReadModel[] = [
      {
        id: 'cached-1',
        slug: 'cached-game',
        title: 'Cached Game',
        type: MediaType.GAME,
        coverUrl: 'http://cache.jpg',
        rating: 9.5,
        releaseYear: 2023,
        description: 'A cached game',
        isImported: true,
        eloScore: 1800,
        tags: [],
      },
    ];

    mockRedis.get.mockResolvedValue(JSON.stringify(cachedTrends));

    const result = await handler.execute({ limit: 5 });

    expect(mockRedis.get).toHaveBeenCalledWith('catalog:top-rated:limit:5');
    expect(mockRepo.findTopRated).not.toHaveBeenCalled(); // Should NOT query DB
    expect(result.getValue()).toEqual(cachedTrends);
  });

  it('should fetch from DB and cache on cache miss', async () => {
    const dbTrends: MediaReadModel[] = [
      {
        id: 'db-1',
        slug: 'top-game',
        title: 'Top Game',
        type: MediaType.GAME,
        coverUrl: 'http://cover.jpg',
        rating: 95,
        releaseYear: 2023,
        description: 'Desc',
        isImported: true,
        eloScore: 1200,
        tags: [],
      },
      {
        id: 'db-2',
        slug: 'second-game',
        title: 'Second Game',
        type: MediaType.GAME,
        coverUrl: 'http://img.com/second.jpg',
        rating: 9.2,
        releaseYear: 2023,
        description: null,
        isImported: true,
        eloScore: 1900,
        tags: [],
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
    expect(result.getValue()).toEqual(dbTrends);
  });

  it('should include eloScore field in results', async () => {
    const trendsWithElo: MediaReadModel[] = [
      {
        id: 'elo-1',
        slug: 'high-elo-game',
        title: 'High ELO Game',
        type: MediaType.GAME,
        coverUrl: 'http://img.com/elo.jpg',
        rating: null,
        releaseYear: 2024,
        description: null,
        isImported: true,
        eloScore: 2100, // HIGH ELO
        tags: [],
      },
      {
        id: 'elo-2',
        slug: 'medium-elo-game',
        title: 'Medium ELO Game',
        type: MediaType.MOVIE,
        coverUrl: null,
        rating: 8.5,
        releaseYear: 2022,
        description: null,
        isImported: true,
        eloScore: 1650, // MEDIUM ELO
        tags: [],
      },
    ];

    mockRedis.get.mockResolvedValue(null);
    mockRepo.findTopRated.mockResolvedValue(trendsWithElo);

    const result = await handler.execute({ limit: 10 });

    expect(result.getValue()).toHaveLength(2);
    expect(result.getValue()[0]?.eloScore).toBe(2100);
    expect(result.getValue()[1]?.eloScore).toBe(1650);
    expect(result.getValue().every((item) => 'eloScore' in item)).toBe(true);
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

    expect(result.getValue()).toEqual([]);
    expect(mockRedis.set).toHaveBeenCalled(); // Should still cache empty result
  });
});
