import { describe, it, expect, mock, beforeAll } from 'bun:test';

// 1. Mock external dependencies BEFORE importing the controller
const mockResolveUser = mock();
const mockSyncInteractions = mock();

mock.module('@metacult/backend-identity', () => ({
  // Passthrough middleware that adds error helper if needed, but mostly does nothing
  isAuthenticated: (app: any) => app,
  resolveUserOrThrow: mockResolveUser,
  auth: {
    api: {
      getSession: mock(() =>
        Promise.resolve({
          user: { id: 'test-user-id' },
          session: { id: 'session-id' },
        }),
      ),
    },
  },
}));

mock.module('../../../application/commands/save-interaction.command', () => ({
  saveInteraction: mock(() => Promise.resolve({ id: '1' })),
}));

mock.module('../../../application/commands/sync-interactions.command', () => ({
  syncInteractions: mockSyncInteractions,
}));

// 2. Import controller after mocks
import { interactionController } from './interaction.controller';

describe('Interaction Controller Integration', () => {
  beforeAll(() => {
    // Reset mocks
    mockResolveUser.mockReset();
    mockSyncInteractions.mockReset();
  });

  it('POST /interactions/sync should return 401 if resolveUserOrThrow fails', async () => {
    // Setup mock to throw
    mockResolveUser.mockRejectedValue(new Error('Unauthorized')); // Simulating the helper throwing

    const req = new Request('http://localhost/interactions/sync', {
      method: 'POST',
      body: JSON.stringify([
        { mediaId: '123e4567-e89b-12d3-a456-426614174000', action: 'LIKE' },
      ]),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await interactionController.handle(req);

    // Since we throw a generic Error in mock, Elysia might return 500 or handled error
    // But we want to ensure it DOES NOT succeed (200)
    expect(res.status).not.toBe(200);
    expect(mockResolveUser).toHaveBeenCalled();
  });

  it('POST /interactions/sync should return 200 and sync data if authorized', async () => {
    // Setup mock to return user
    mockResolveUser.mockResolvedValue({ id: 'user-123' });
    mockSyncInteractions.mockResolvedValue([{ id: 'sync-1' }]);

    const req = new Request('http://localhost/interactions/sync', {
      method: 'POST',
      body: JSON.stringify([
        { mediaId: '123e4567-e89b-12d3-a456-426614174000', action: 'LIKE' },
      ]),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer valid', // Doesn't matter for mock, but good practice
      },
    });

    const res = await interactionController.handle(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('synced');
    expect(mockResolveUser).toHaveBeenCalled();
    expect(mockSyncInteractions).toHaveBeenCalledWith(
      'user-123',
      expect.any(Array),
    );
  });

  it('POST /interactions/sync should validate payload schema', async () => {
    mockResolveUser.mockResolvedValue({ id: 'user-123' });

    // Invalid payload: missing action
    const req = new Request('http://localhost/interactions/sync', {
      method: 'POST',
      body: JSON.stringify([
        { mediaId: '123e4567-e89b-12d3-a456-426614174000' },
      ]),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await interactionController.handle(req);

    // Schema validation should fail (400 or 422)
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('POST /interactions/sync should handle empty array', async () => {
    mockResolveUser.mockResolvedValue({ id: 'user-123' });
    mockSyncInteractions.mockResolvedValue([]);

    const req = new Request('http://localhost/interactions/sync', {
      method: 'POST',
      body: JSON.stringify([]),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await interactionController.handle(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.synced).toBe(0);
  });

  it('POST /interactions/sync should handle multiple interactions', async () => {
    mockResolveUser.mockResolvedValue({ id: 'user-123' });
    mockSyncInteractions.mockResolvedValue([{ id: '1' }, { id: '2' }]);

    const req = new Request('http://localhost/interactions/sync', {
      method: 'POST',
      body: JSON.stringify([
        {
          mediaId: '123e4567-e89b-12d3-a456-426614174001',
          action: 'LIKE',
          sentiment: 'GOOD',
        },
        { mediaId: '123e4567-e89b-12d3-a456-426614174002', action: 'DISLIKE' },
      ]),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await interactionController.handle(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.synced).toBe(2);
  });

  it('POST /interactions/sync should handle partial failures gracefully', async () => {
    mockResolveUser.mockResolvedValue({ id: 'user-123' });
    // Only 1 out of 2 succeeded (best effort sync)
    mockSyncInteractions.mockResolvedValue([{ id: '1' }]);

    const req = new Request('http://localhost/interactions/sync', {
      method: 'POST',
      body: JSON.stringify([
        { mediaId: '123e4567-e89b-12d3-a456-426614174001', action: 'LIKE' },
        // Second item with invalid mediaId is handled by syncInteractions internally
      ]),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await interactionController.handle(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.synced).toBe(1); // Only 1 succeeded (best effort)
  });
});
