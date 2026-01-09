import { describe, it, expect, mock } from 'bun:test';
import { syncInteractions } from './sync-interactions.command';

describe('Sync Interactions Command', () => {
  it('should ignore foreign key violations and continue (Best Effort)', async () => {
    // Mock chain for Select (Check SKIP)
    const mockSelect = mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => Promise.resolve([])), // No existing interaction
        })),
      })),
    }));

    // Mock chain for Insert -> Throw FK Violation
    const mockInsert = mock(() => ({
      values: mock(() => ({
        onConflictDoUpdate: mock(() => ({
          returning: mock(() => {
            // Simulate Postgres FK Error
            const err: any = new Error('FK Constraint');
            err.code = '23503';
            return Promise.reject(err);
          }),
        })),
      })),
    }));

    const mockDb = {
      select: mockSelect,
      insert: mockInsert,
    };

    const payload = [{ mediaId: 'invalid-id', action: 'LIKE' }];

    // Should NOT throw
    const results = await syncInteractions('user-1', payload, mockDb as any);

    expect(results).toHaveLength(0); // Skipped
  });

  it('should sync valid interactions successfully', async () => {
    const mockSelect = mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() => Promise.resolve([])),
        })),
      })),
    }));

    const mockInsert = mock(() => ({
      values: mock(() => ({
        onConflictDoUpdate: mock(() => ({
          returning: mock(() =>
            Promise.resolve([{ id: '1', mediaId: 'valid-id', action: 'LIKE' }]),
          ),
        })),
      })),
    }));

    const mockDb = {
      select: mockSelect,
      insert: mockInsert,
    };

    const payload = [{ mediaId: 'valid-id', action: 'LIKE' }];
    const results = await syncInteractions('user-1', payload, mockDb as any);

    expect(results).toHaveLength(1);
    expect(results[0]!.action).toBe('LIKE');
  });

  it('should skip update if action is SKIP and interaction already exists', async () => {
    // Mock Select returning existing interaction
    const mockSelect = mock(() => ({
      from: mock(() => ({
        where: mock(() => ({
          limit: mock(() =>
            Promise.resolve([{ id: 'existing', action: 'LIKE' }]),
          ),
        })),
      })),
    }));

    // Insert should NOT be called
    const mockInsert = mock(() => ({}));

    const mockDb = {
      select: mockSelect,
      insert: mockInsert,
    };

    const payload = [{ mediaId: 'existing-id', action: 'SKIP' }];
    const results = await syncInteractions('user-1', payload, mockDb as any);

    expect(mockInsert).not.toHaveBeenCalled();
    expect(results).toHaveLength(0);
  });
});
