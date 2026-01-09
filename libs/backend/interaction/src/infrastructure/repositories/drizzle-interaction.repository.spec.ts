import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { DrizzleInteractionRepository } from './drizzle-interaction.repository';
import {
  UserInteraction,
  InteractionAction,
  InteractionSentiment,
} from '../../domain/entities/user-interaction.entity';

describe('DrizzleInteractionRepository', () => {
  let repository: DrizzleInteractionRepository;
  let mockDb: any;

  const mockInteraction = new UserInteraction({
    id: 'uuid-123',
    userId: 'user-1',
    mediaId: 'media-1',
    action: InteractionAction.LIKE,
    sentiment: InteractionSentiment.GOOD,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  });

  beforeEach(() => {
    // Mock chainable Drizzle methods
    mockDb = {
      insert: mock(() => mockDb),
      values: mock(() => mockDb),
      onConflictDoUpdate: mock(() => Promise.resolve()),
      select: mock(() => mockDb),
      from: mock(() => mockDb),
      where: mock(() => mockDb),
      limit: mock(() => mockDb),
    };
    repository = new DrizzleInteractionRepository(mockDb);
  });

  it('should save interaction with upsert logic', async () => {
    await repository.save(mockInteraction);

    expect(mockDb.insert).toHaveBeenCalled();
    expect(mockDb.values).toHaveBeenCalledWith({
      id: mockInteraction.id,
      userId: mockInteraction.userId,
      mediaId: mockInteraction.mediaId,
      action: mockInteraction.action,
      sentiment: mockInteraction.sentiment,
      createdAt: mockInteraction.createdAt,
      updatedAt: mockInteraction.updatedAt,
    });
    expect(mockDb.onConflictDoUpdate).toHaveBeenCalled();
  });

  it('should find interaction by user and media', async () => {
    // Mock return value for the chain
    const mockResult = [
      {
        id: 'uuid-123',
        userId: 'user-1',
        mediaId: 'media-1',
        action: 'LIKE',
        sentiment: 'GOOD',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      },
    ];

    // Setup the mock chain to return our result
    // select -> from -> where -> limit -> Promise resolves to array
    const mockLimit = mock(() => Promise.resolve(mockResult));

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit = mockLimit;

    const result = await repository.findByUserAndMedia('user-1', 'media-1');

    expect(mockDb.select).toHaveBeenCalled();
    expect(mockDb.from).toHaveBeenCalled();
    expect(mockDb.where).toHaveBeenCalled();
    expect(mockDb.limit).toHaveBeenCalledWith(1);

    expect(result).not.toBeNull();
    expect(result).toBeInstanceOf(UserInteraction);
    expect(result?.id).toBe('uuid-123');
    expect(result?.action).toBe(InteractionAction.LIKE);
  });

  it('should return null if no interaction found', async () => {
    const mockLimit = mock(() => Promise.resolve([]));

    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where.mockReturnValue(mockDb);
    mockDb.limit = mockLimit;

    const result = await repository.findByUserAndMedia('user-1', 'unknown');

    expect(result).toBeNull();
  });

  it('should find all interactions by user', async () => {
    const mockResults = [
      { id: '1', userId: 'user-1', action: 'LIKE' },
      { id: '2', userId: 'user-1', action: 'WISHLIST' },
    ];

    // select -> from -> where -> Promise resolves
    // Drizzle's where() returns a promise-like QueryBuilder, or we await it.
    // In our code: await this.db.select().from().where()
    // So where() should return the promise
    mockDb.select.mockReturnValue(mockDb);
    mockDb.from.mockReturnValue(mockDb);
    mockDb.where = mock(() => Promise.resolve(mockResults));

    const results = await repository.findAllByUser('user-1');

    expect(mockDb.select).toHaveBeenCalled();
    expect(results).toHaveLength(2);
    expect(results[0]).toBeInstanceOf(UserInteraction);
    expect(results[0]?.action).toBe(InteractionAction.LIKE);
  });
});
