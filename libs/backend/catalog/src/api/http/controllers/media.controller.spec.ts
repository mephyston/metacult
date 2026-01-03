import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { MediaController } from './media.controller';

describe('Media Controller', () => {
  let controller: MediaController;
  let mockSearchHandler: any;
  let mockImportHandler: any;
  let mockGetRecentHandler: any;
  let mockGetTopRatedHandler: any;
  let mockGetMediaByIdHandler: any;

  beforeEach(() => {
    mockSearchHandler = {
      execute: mock(() => Promise.resolve({ local: [], remote: [] })),
    };
    mockImportHandler = { execute: mock(() => Promise.resolve()) };
    mockGetRecentHandler = { execute: mock(() => Promise.resolve([])) };

    mockGetTopRatedHandler = {
      execute: mock(() =>
        Promise.resolve([
          {
            id: 'trend-1',
            slug: 'top-game',
            title: 'Top Game',
            type: 'game',
            coverUrl: 'http://cover.jpg',
            rating: 95,
            releaseYear: 2024,
            description: null,
            isImported: true,
            eloScore: 2100,
            tags: ['Action', 'RPG'],
          },
          {
            id: 'trend-2',
            slug: 'second-game',
            title: 'Second Game',
            type: 'movie',
            coverUrl: 'http://cover2.jpg',
            rating: 88,
            releaseYear: 2023,
            description: null,
            isImported: true,
            eloScore: 1950,
            tags: ['Drama'],
          },
        ]),
      ),
    };

    mockGetMediaByIdHandler = {
      execute: mock(() =>
        Promise.resolve({
          id: 'media-1',
          slug: 'test-media',
          title: 'Test Media',
          type: 'game',
          coverUrl: null,
          rating: null,
          releaseYear: 2022,
          description: 'A test media',
          isImported: true,
          eloScore: 1500,
        }),
      ),
    };

    controller = new MediaController(
      mockSearchHandler,
      mockImportHandler,
      mockGetRecentHandler,
      mockGetMediaByIdHandler,
      mockGetTopRatedHandler,
    );
  });

  it('getTrends should return top rated media with eloScore', async () => {
    const result = await controller.getTrends();

    expect(mockGetTopRatedHandler.execute).toHaveBeenCalledWith({ limit: 5 });
    expect(result).toHaveLength(2);
    expect(result[0]?.eloScore).toBe(2100);
    expect(result[0]?.title).toBe('Top Game');
    expect(result[1]?.eloScore).toBe(1950);
    expect(result[1]?.title).toBe('Second Game');
  });

  it('getTrends should include all MediaReadDto fields including eloScore', async () => {
    const result = await controller.getTrends();

    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('slug');
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('type');
    expect(result[0]).toHaveProperty('coverUrl');
    expect(result[0]).toHaveProperty('rating');
    expect(result[0]).toHaveProperty('releaseYear');
    expect(result[0]).toHaveProperty('description');
    expect(result[0]).toHaveProperty('isImported');
    expect(result[0]).toHaveProperty('eloScore'); // CRITICAL FIELD
    expect(result[0]).toHaveProperty('tags');
  });

  it('getTrends should default to limit 5', async () => {
    await controller.getTrends();

    expect(mockGetTopRatedHandler.execute).toHaveBeenCalledWith({ limit: 5 });
  });

  it('getTrends should return empty array if no trends', async () => {
    mockGetTopRatedHandler.execute.mockResolvedValueOnce([]);

    const result = await controller.getTrends();

    expect(result).toEqual([]);
  });

  it('getById should return media details by ID', async () => {
    const result = await controller.getById('media-1');

    expect(mockGetMediaByIdHandler.execute).toHaveBeenCalled();
    expect(result.id).toBe('media-1');
    expect(result.title).toBe('Test Media');
  });
});
