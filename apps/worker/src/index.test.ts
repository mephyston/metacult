import { describe, it, expect, mock } from 'bun:test';

// 1. Mock infrastructure to capture createWorker calls
const mockCreateWorker = mock(() => ({
  close: async () => {
    /* mock */
  },
  on: () => {
    /* mock */
  },
}));

// Mock the processor to avoid its dependencies (db, etc.)
// Processor mock removed to prevent leakage into other tests

// Mock the DEEP IMPORT path now used by worker/src/index.ts
// Mock the DEEP IMPORT path now used by worker/src/index.ts
// bun test might resolve aliases to absolute paths, so we need to be careful with double mocking.
// Merging into one mock block for safety.

mock.module('@metacult/backend/infrastructure', () => {
  return {
    createWorker: mockCreateWorker,
    IMPORT_QUEUE_NAME: 'import-queue',
    getDbConnection: () => ({ db: {} }),
    importQueue: { add: mock(() => Promise.resolve()) },
    logger: {
      info: mock(() => {}),
      error: mock(() => {}),
      warn: mock(() => {}),
      debug: mock(() => {}),
    },
    configService: {
      get: (key: string) => 'mock-value',
      isProduction: false,
      isDevelopment: true,
      isStaging: false,
      isTest: true,
    },
    cacheService: {
      getOrSet: async () => null,
      get: async () => null,
      set: async () => null,
    }, // Mock cacheService
    CacheService: class {},
    redisClient: {},
    DrizzleMediaRepository: class {},
    IgdbAdapter: class {},
    TmdbAdapter: class {},
    GoogleBooksAdapter: class {},
    requestContext: {
      run: (_: any, cb: () => any) => cb(),
      get: () => ({ requestId: 'test-id' }),
      getRequestId: () => 'test-id',
    },
    patchConsole: () => {
      /* mock */
    },
  };
});

describe('Worker Configuration', () => {
  it('should initialize import-queue worker with rate limiting', async () => {
    // 2. Import the worker index
    const { startWorker } = await import('./index');
    await startWorker;

    // 3. Verify createWorker was called
    expect(mockCreateWorker).toHaveBeenCalled();

    // 4. Inspect arguments
    const calls = mockCreateWorker.mock.calls as unknown as any[];
    if (calls.length === 0) throw new Error('Worker not created');

    const args = calls[0]; // First call arguments: [queueName, processor, options]

    const queueName = args[0];
    const options = args[2]; // Cast to avoid undefined error

    expect(queueName).toBe('import-queue');

    // 5. Verify Rate Limiter Configuration
    expect(options).toBeDefined();
    expect(options.limiter).toEqual({
      max: 1,
      duration: 1100,
    });

    console.log('✅ Verified Rate Limiter: max=1, duration=1100ms');
  });
});
