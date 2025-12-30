import { describe, it, expect, mock } from 'bun:test';
import { IMPORT_QUEUE_NAME } from '@metacult/backend/infrastructure';

// 1. Mock infrastructure to capture createWorker calls
const mockCreateWorker = mock(() => ({
    close: async () => { /* mock */ },
    on: () => { /* mock */ },
}));

// Mock the processor to avoid its dependencies (db, etc.)
// Processor mock removed to prevent leakage into other tests


// Mock the DEEP IMPORT path now used by worker/src/index.ts
mock.module('@metacult/backend/infrastructure', () => {
    return {
        createWorker: mockCreateWorker,
        IMPORT_QUEUE_NAME: 'import-queue'
    };
});

// Mock infrastructure
mock.module("@metacult/backend/infrastructure", () => {
    return {
        createWorker: mockCreateWorker,
        IMPORT_QUEUE_NAME: 'import-queue',
        // Stubs for processor imports
        getDbConnection: () => ({ db: {} }),
        DrizzleMediaRepository: class { },
        IgdbAdapter: class { },
        TmdbAdapter: class { },
        GoogleBooksAdapter: class { }
    };
});

describe("Worker Configuration", () => {
    it("should initialize import-queue worker with rate limiting", async () => {
        // 2. Import the worker index
        await import("./index");

        // 3. Verify createWorker was called
        expect(mockCreateWorker).toHaveBeenCalled();

        // 4. Inspect arguments
        const calls = mockCreateWorker.mock.calls;
        if (calls.length === 0) throw new Error("Worker not created");

        const args = calls[0]; // First call arguments: [queueName, processor, options]

        const queueName = args[0];
        const options = args[2] as any; // Cast to avoid undefined error

        expect(queueName).toBe('import-queue');

        // 5. Verify Rate Limiter Configuration
        expect(options).toBeDefined();
        expect(options.limiter).toEqual({
            max: 1,
            duration: 1100
        });

        console.log("✅ Verified Rate Limiter: max=1, duration=1100ms");
    });
});
