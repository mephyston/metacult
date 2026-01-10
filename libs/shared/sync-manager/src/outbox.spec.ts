import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addToOutbox, processOutbox, type OutboxAction } from './outbox';

// Mock DB
const mockAdd = vi.fn();
const mockWhere = vi.fn();
const mockEquals = vi.fn();
const mockLimit = vi.fn();
const mockToArray = vi.fn();
const mockBulkDelete = vi.fn();

// Chain setup for Dexie
mockWhere.mockReturnValue({
  equals: mockEquals.mockReturnValue({
    limit: mockLimit.mockReturnValue({
      toArray: mockToArray,
    }),
  }),
});

const mockDb = {
  outbox: {
    add: mockAdd,
    where: mockWhere,
    bulkDelete: mockBulkDelete,
  },
};

vi.mock('@metacult/shared-local-db', () => ({
  db: mockDb,
}));

// Mock Logger
vi.mock('@metacult/shared-core', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Fetch
const mockFetch = vi.fn();
// @ts-expect-error - Partial mock is fine for tests
global.fetch = mockFetch;

describe('Outbox Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default fetch success
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  describe('addToOutbox', () => {
    it('should add action to db with pending status', async () => {
      const action: OutboxAction = {
        type: 'SWIPE',
        payload: { foo: 'bar' },
        createdAt: 1234567890,
      };

      await addToOutbox(action);

      expect(mockAdd).toHaveBeenCalledWith({
        ...action,
        status: 'pending',
      });
    });
  });

  describe('processOutbox', () => {
    it('should do nothing if no pending items', async () => {
      mockToArray.mockResolvedValue([]);

      await processOutbox('http://api.com');

      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should send pending items to API and delete on success', async () => {
      const items = [
        {
          id: 1,
          type: 'SWIPE',
          payload: { a: 1 },
          createdAt: 100,
          status: 'pending',
        },
        {
          id: 2,
          type: 'DUEL_VOTE',
          payload: { b: 2 },
          createdAt: 200,
          status: 'pending',
        },
      ];
      mockToArray.mockResolvedValue(items);

      await processOutbox('http://api.com');

      // Verify Fetch
      expect(mockFetch).toHaveBeenCalledWith(
        'http://api.com/api/sync',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify([
            { type: 'SWIPE', payload: { a: 1 }, timestamp: 100 },
            { type: 'DUEL_VOTE', payload: { b: 2 }, timestamp: 200 },
          ]),
        }),
      );

      // Verify Delete
      expect(mockBulkDelete).toHaveBeenCalledWith([1, 2]);
    });

    it('should include auth token if provided', async () => {
      mockToArray.mockResolvedValue([{ id: 1 }]);

      await processOutbox('http://api.com', async () => 'secret-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer secret-token',
          }),
        }),
      );
    });

    it('should NOT delete items on API failure', async () => {
      mockToArray.mockResolvedValue([{ id: 1 }]);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Server Error',
      });

      await processOutbox('http://api.com');

      expect(mockFetch).toHaveBeenCalled();
      expect(mockBulkDelete).not.toHaveBeenCalled();
    });

    it('should handle network errors gracefully', async () => {
      mockToArray.mockResolvedValue([{ id: 1 }]);
      mockFetch.mockRejectedValue(new Error('Network Down'));

      await processOutbox('http://api.com');

      expect(mockBulkDelete).not.toHaveBeenCalled();
      // Should not throw
    });
  });
});
