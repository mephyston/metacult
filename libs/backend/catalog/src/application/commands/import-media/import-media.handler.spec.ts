import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ImportMediaHandler } from './import-media.handler';
import { MediaType } from '../../../domain/entities/media.entity';
import type { ImportMediaCommand } from './import-media.command';
import type { Media } from '../../../domain/entities/media.entity';
import { InvalidProviderDataError } from '../../../domain/errors/catalog.errors';

describe('ImportMediaHandler', () => {
  let handler: ImportMediaHandler;
  let mockRepo: any;
  let mockIgdb: any;
  let mockTmdb: any;
  let mockGoogleBooks: any;

  beforeEach(() => {
    mockRepo = {
      findById: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve()),
      findAll: mock(() => Promise.resolve([])),
      findByType: mock(() => Promise.resolve([])),
      findByProviderId: mock(() => Promise.resolve(null)),
      nextId: mock(() => 'generated-uuid'),
    };
    mockIgdb = { getMedia: mock(() => Promise.resolve(null)) };
    mockTmdb = { getMedia: mock(() => Promise.resolve(null)) };
    mockGoogleBooks = { getMedia: mock(() => Promise.resolve(null)) };

    handler = new ImportMediaHandler(
      mockRepo,
      mockIgdb,
      mockTmdb,
      mockGoogleBooks,
    );
  });

  it('should throw MediaAlreadyExistsError if media already exists', async () => {
    mockRepo.findByProviderId.mockResolvedValue({ id: '123' });
    const command: ImportMediaCommand = {
      mediaId: '123',
      type: MediaType.GAME,
    };

    await expect(handler.execute(command)).rejects.toThrow();

    expect(mockRepo.findByProviderId).toHaveBeenCalledWith('igdb', '123');
    expect(mockIgdb.getMedia).not.toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should route GAME type to IgdbAdapter', async () => {
    const mockMedia = {
      id: '123',
      title: 'Test Game',
      type: MediaType.GAME,
    } as Media;
    mockIgdb.getMedia.mockResolvedValue(mockMedia);
    const command: ImportMediaCommand = {
      mediaId: '123',
      type: MediaType.GAME,
    };

    await handler.execute(command);

    expect(mockIgdb.getMedia).toHaveBeenCalledWith(
      '123',
      MediaType.GAME,
      'generated-uuid',
    );
    expect(mockRepo.create).toHaveBeenCalledWith(mockMedia);
  });

  it('should route MOVIE type to TmdbAdapter', async () => {
    const mockMedia = {
      id: '456',
      title: 'Test Movie',
      type: MediaType.MOVIE,
    } as Media;
    mockTmdb.getMedia.mockResolvedValue(mockMedia);
    const command: ImportMediaCommand = {
      mediaId: '456',
      type: MediaType.MOVIE,
    };

    await handler.execute(command);

    expect(mockTmdb.getMedia).toHaveBeenCalledWith(
      '456',
      MediaType.MOVIE,
      'generated-uuid',
    );
    expect(mockRepo.create).toHaveBeenCalledWith(mockMedia);
  });

  it('should throw if provider returns null', async () => {
    mockIgdb.getMedia.mockResolvedValue(null);
    const command: ImportMediaCommand = {
      mediaId: '404',
      type: MediaType.GAME,
    };

    // Expect to throw
    await expect(handler.execute(command)).rejects.toThrow('Media not found');

    expect(mockIgdb.getMedia).toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should propagate InvalidProviderDataError without wrapping', async () => {
    mockIgdb.getMedia.mockRejectedValue(
      new InvalidProviderDataError('IGDB', 'Missing name'),
    );
    const command: ImportMediaCommand = {
      mediaId: '999',
      type: MediaType.GAME,
    };

    // Should throw InvalidProviderDataError directly, NOT ProviderUnavailableError
    await expect(handler.execute(command)).rejects.toThrow(
      InvalidProviderDataError,
    );
  });
});
