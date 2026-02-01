import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { createCatalogRoutes } from '../api/routes';
import { MediaController } from '../api/http/controllers/media.controller';
import { SearchMediaHandler } from '../application/queries/search-media/search-media.handler';
import { MediaType } from '../domain/entities/media.entity';

// Mock infrastructure
mock.module('@metacult/backend-infrastructure', () => ({
  logger: {
    info: () => void 0,
    error: () => void 0,
    warn: () => void 0,
    debug: () => void 0,
  },
  configService: {
    get: (key: string) => {
      if (key === 'BETTER_AUTH_URL') return 'http://localhost:3000';
      if (key === 'PUBLIC_API_URL') return 'http://localhost:3000';
      return 'mock-value';
    },
    isProduction: false,
    isDevelopment: true,
    isStaging: false,
    isTest: true,
  },
}));

// Mocks
const mockRepo = { searchViews: mock(() => Promise.resolve([] as unknown[])) };
const mockRedis = {
  get: mock(() => Promise.resolve(null)),
  set: mock(() => Promise.resolve('OK')),
};
const mockIgdb = { search: mock(() => Promise.resolve([] as unknown[])) };
const mockTmdb = { search: mock(() => Promise.resolve([] as unknown[])) };
const mockGbooks = { search: mock(() => Promise.resolve([] as unknown[])) };

// Handler
const searchHandler = new SearchMediaHandler(
  mockRepo as any, // Mocks are partials
  mockRedis as any,
  mockIgdb as any,
  mockTmdb as any,
  mockGbooks as any,
);

// Other Handlers (Mocked merely for Controller instantiation)
const mockImportHandler = { execute: mock() } as any;
const mockRecentHandler = { execute: mock() } as any;
const mockGetByIdHandler = { execute: mock() } as any;
const mockGetTopRatedHandler = { execute: mock() } as any;

// Controller
const controller = new MediaController(
  searchHandler,
  mockImportHandler,
  mockRecentHandler,
  mockGetByIdHandler,
  mockGetTopRatedHandler,
);

const app = createCatalogRoutes(controller);

describe('Search Integration (API -> Handler)', () => {
  beforeEach(() => {
    mockRepo.searchViews.mockClear();
    mockIgdb.search.mockClear();
    mockRedis.get.mockClear();
  });

  it('should return 200 and grouped structure (Local)', async () => {
    // Mock Repo returning 1 item
    mockRepo.searchViews.mockResolvedValue([
      {
        id: 'local-1',
        title: 'Test Game',
        slug: 'test-game',
        type: 'game',
        releaseYear: 2024,
        coverUrl: null,
        isImported: true,
      },
    ]);

    const res = await app.handle(
      new Request('http://localhost/media/search?q=test'),
    );
    expect(res.status).toBe(200);

    const json = (await res.json()) as { games: any[] }; // Explicit shape instead of any
    expect(json.games).toHaveLength(1);
    expect(json.games[0].title).toBe('Test Game');
    expect(json.games[0].isImported).toBe(true);
    expect(json.games[0].slug).toBe('test-game');
  });

  it('should trigger remote search and return structured result', async () => {
    mockRepo.searchViews.mockResolvedValue([]);
    mockIgdb.search.mockResolvedValue([
      {
        id: 'remote-1',
        title: 'Remote Game',
        slug: 'remote-game',
        type: MediaType.GAME,
        releaseYear: { value: 2024 },
        coverUrl: null,
        externalReference: { id: 'ext-1' },
      },
    ]);

    const res = await app.handle(
      new Request('http://localhost/media/search?q=remote'),
    );
    expect(res.status).toBe(200);

    const json = (await res.json()) as { games: any[] };
    expect(json.games).toHaveLength(1);
    expect(json.games[0].isImported).toBe(false);
    expect(mockIgdb.search).toHaveBeenCalled();
  });

  it('should validate query length', async () => {
    const res = await app.handle(
      new Request('http://localhost/media/search?q=a'),
    );
    // < 3 chars handled by Handler logic returns empty, OR < 1 char validation error
    // Handler says: if < 3 returns empty. Route validation says minLength: 1.
    expect(res.status).toBe(200);
    const json = (await res.json()) as { games: unknown[] };
    expect(json.games).toHaveLength(0);
  });

  it('should handle validation error for empty query', async () => {
    try {
      const res = await app.handle(
        new Request('http://localhost/media/search?q='),
      );
      // Elysia should return 422 for validation errors
      expect(res.status).toBe(422);
    } catch (error: unknown) {
      // If Elysia throws instead of returning response, check error properties
      const err = error as { status: number; code: string };
      expect(err.status).toBe(422);
      expect(err.code).toBe('VALIDATION');
    }
  });
});
