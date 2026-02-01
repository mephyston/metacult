import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { SyncInteractionsHandler } from './sync-interactions.command';
import type { IInteractionRepository } from '../../domain/ports/interaction.repository.interface';

describe('SyncInteractionsHandler', () => {
  let handler: SyncInteractionsHandler;
  let mockRepo: IInteractionRepository;

  beforeEach(() => {
    mockRepo = {
      saveInteraction: mock(() => Promise.resolve()),
      getInteractions: mock(() => Promise.resolve([])),
      getInteractionCount: mock(() => Promise.resolve(0)),
      syncInteractions: mock(() => Promise.resolve()),
    } as unknown as IInteractionRepository;

    handler = new SyncInteractionsHandler(mockRepo);
  });

  it('should delegate to repository syncInteractions', async () => {
    const userId = 'user-1' as any; // Cast to UserId
    const payload = [{ mediaId: 'media-1', action: 'LIKE' as const }];

    await handler.execute(userId, payload);

    expect(mockRepo.syncInteractions).toHaveBeenCalledWith(userId, payload);
  });
});
