import { describe, it, expect, mock, spyOn } from "bun:test";

// 1. Mock infrastructure to capture createWorker calls
const mockCreateWorker = mock(() => ({
    close: async () => { }, // mock close method
    on: () => { }, // mock event listeners
}));

// Mock the processor to avoid its dependencies (db, etc.)
mock.module("./processors/import-media.processor", () => ({
    processImportMedia: mock(() => Promise.resolve()),
}));

// Mock infrastructure
mock.module("@metacult/backend/infrastructure", () => {
    return {
        createWorker: mockCreateWorker,
        IMPORT_QUEUE_NAME: 'import-queue'
    };
});

describe("Worker Configuration", () => {
    it("should initialize import-queue worker with rate limiting", async () => {
        // 2. Import the worker index (which executes the createWorker call)
        // We use dynamic import to ensure mocks are active before execution
        await import("./index");

        // 3. Verify createWorker was called
        expect(mockCreateWorker).toHaveBeenCalled();

        // 4. Inspect arguments
        const calls = mockCreateWorker.mock.calls;
        const args = calls[0]; // First call arguments: [queueName, processor, options]

        const queueName = args[0];
        const options = args[2];

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
