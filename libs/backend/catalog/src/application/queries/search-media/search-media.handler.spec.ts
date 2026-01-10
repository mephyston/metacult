import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { SearchMediaHandler } from './search-media.handler';
import { MediaType } from '../../../domain/entities/media.entity';
import type { SearchMediaQuery } from './search-media.query';
import type { SearchResultItemSchema } from '../../../api/http/dtos/media.dtos';
import type { Static } from 'elysia';

type SearchResultItem = Static<typeof SearchResultItemSchema>;

describe('SearchMediaHandler', () => {
  let handler: SearchMediaHandler;
  let mockRepo: any;
  let mockRedis: any;
  let mockIgdb: any;
  let mockTmdb: any;
  let mockGoogleBooks: any;

  beforeEach(() => {
    mockRepo = {
      searchViews: mock(() => Promise.resolve([])),
    };
    mockRedis = {
      get: mock(() => Promise.resolve(null)),
      set: mock(() => Promise.resolve('OK')),
    };
    mockIgdb = { search: mock(() => Promise.resolve([])) };
    mockTmdb = { search: mock(() => Promise.resolve([])) };
    mockGoogleBooks = { search: mock(() => Promise.resolve([])) };

    handler = new SearchMediaHandler(
      mockRepo,
      mockRedis,
      mockIgdb,
      mockTmdb,
      mockGoogleBooks,
    );
  });

  it('should return local results immediately if sufficient count', async () => {
    const localResults = Array(10)
      .fill(null)
      .map((_, i) => ({
        id: `local-${i}`,
        title: `Local Game ${i}`,
        slug: `local-game-${i}`,
        type: 'game',
        releaseYear: 2020 + i,
        coverUrl: 'http://img',
        externalReference: { id: `ext-${i}` },
      }));

    mockRepo.searchViews.mockResolvedValue(localResults);

    const query: SearchMediaQuery = { search: 'test' };
    const response = (await handler.execute(query)).getValue() as any;

    expect(mockRepo.searchViews).toHaveBeenCalled();
    expect(mockIgdb.search).not.toHaveBeenCalled(); // Should NOT call remote
    expect(response.games).toHaveLength(10);
    expect(response.games[0]!.isImported).toBe(true);
  });

  it('should call remote providers if local results are insufficient', async () => {
    mockRepo.searchViews.mockResolvedValue([]); // 0 local results

    mockIgdb.search.mockResolvedValue([
      {
        id: 'remote-1',
        title: 'Remote Game',
        slug: 'remote-game',
        type: MediaType.GAME,
        releaseYear: { value: 2021 },
        coverUrl: { value: 'http://img' },
        externalReference: { id: 'igdb-1' },
      },
    ]);

    const query: SearchMediaQuery = { search: 'remote' };
    const response = (await handler.execute(query)).getValue() as any;

    expect(mockIgdb.search).toHaveBeenCalled();
    expect(response.games).toHaveLength(1);
    expect(response.games[0]!.title).toBe('Remote Game');
    expect(response.games[0]!.isImported).toBe(false);
  });

  it('should deduplicate remote results if they exist locally', async () => {
    // Local has "Mario"
    mockRepo.searchViews.mockResolvedValue([
      {
        id: 'local-1',
        title: 'Mario',
        slug: 'mario',
        type: 'game',
        releaseYear: 1985,
        coverUrl: 'http://img',
        externalReference: { id: 'ext-1' },
      },
    ]);

    // Remote also returns "Mario" (same title/year)
    mockIgdb.search.mockResolvedValue([
      {
        id: 'remote-1',
        title: 'Mario',
        slug: 'mario',
        type: MediaType.GAME,
        releaseYear: { value: 1985 },
        coverUrl: { value: 'http://img' },
        externalReference: { id: 'igdb-1' },
      },
    ]);

    // Remote returns "Zelda" (new)
    mockIgdb.search.mockResolvedValueOnce([
      {
        id: 'remote-1',
        title: 'Mario',
        slug: 'mario', // Duplicate
        type: MediaType.GAME,
        releaseYear: { value: 1985 },
        coverUrl: { value: 'http://img' },
        externalReference: { id: 'igdb-1' },
      },
      {
        id: 'remote-2',
        title: 'Zelda',
        slug: 'zelda',
        type: MediaType.GAME,
        releaseYear: { value: 1986 },
        coverUrl: { value: 'http://img' },
        externalReference: { id: 'igdb-2' },
      },
    ]);

    const query: SearchMediaQuery = { search: 'mario' };
    const response = (await handler.execute(query)).getValue() as any;

    const games = response.games;
    expect(games).toHaveLength(2); // Mario (Local) + Zelda (Remote)

    // Verify Order: Local First
    expect(games[0]!.title).toBe('Mario');
    expect(games[0]!.isImported).toBe(true);

    expect(games[1]!.title).toBe('Zelda');
    expect(games[1]!.isImported).toBe(false);
  });

  it('should use Redis cache', async () => {
    const cachedResponse = {
      games: [
        {
          id: 'cached',
          title: 'Cached',
          slug: 'cached',
          type: 'game' as const,
          year: 2024,
          poster: null,
          externalId: null,
          isImported: true,
        },
      ],
      movies: [],
      shows: [],
      books: [],
    };
    mockRedis.get.mockResolvedValue(JSON.stringify(cachedResponse));

    const query: SearchMediaQuery = { search: 'cache' };
    const response = (await handler.execute(query)).getValue();

    expect(mockRedis.get).toHaveBeenCalled();
    expect(mockRepo.searchViews).not.toHaveBeenCalled();
    expect(response).toEqual(cachedResponse);
  });
  it('should IGNORE excludedIds when searching (universal search)', async () => {
    const query: SearchMediaQuery = { search: 'test', excludedIds: ['1', '2'] };
    mockRepo.searchViews.mockResolvedValue([]);

    await handler.execute(query);

    // We expect searchViews to be called WITHOUT excludedIds
    expect(mockRepo.searchViews).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'test',
      }),
    );

    const callArgs = mockRepo.searchViews.mock.calls[0][0];
    expect(callArgs.excludedIds).toBeUndefined();
  });

  it('should use Advanced Mode (Mode B) when minElo is present', async () => {
    // Mock Advanced Search
    const advancedResults = {
      items: [
        new (class MockMedia {
          id = 'adv-1';
          title = 'Advanced Game';
          slug = 'adv-game';
          type = MediaType.GAME;
          releaseYear = { getValue: () => 2022 };
          coverUrl = { getValue: () => 'http://img' };
          externalReference = { id: 'ext-adv' };
        } as any)(),
      ],
      total: 50,
    };

    // We need to extend the mockRepo to include searchAdvanced
    mockRepo.searchAdvanced = mock(() => Promise.resolve(advancedResults));

    const query: SearchMediaQuery = {
      search: 'advanced',
      minElo: 1000,
      page: 1,
      limit: 10,
    };
    const response: any = (await handler.execute(query)).getValue();

    // Verify Mode B logic
    expect(mockRepo.searchAdvanced).toHaveBeenCalledWith(
      expect.objectContaining({
        search: 'advanced',
        minElo: 1000,
        page: 1,
        limit: 10,
      }),
    );

    // Verify Remote Providers NOT called
    expect(mockIgdb.search).not.toHaveBeenCalled();
    expect(mockTmdb.search).not.toHaveBeenCalled();
    expect(mockGoogleBooks.search).not.toHaveBeenCalled();

    // Verify Response Format matches PaginatedSearchResponseDto
    expect(response.items).toHaveLength(1);
    expect(response.total).toBe(50);
    expect(response.page).toBe(1);
    expect(response.totalPages).toBe(5);
    expect(response.items[0].title).toBe('Advanced Game');
  });
});
