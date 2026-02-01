import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { ImportMediaHandler } from './import-media.handler';
import { MediaType, asMediaId } from '../../../index';
import type { ImportMediaCommand } from './import-media.command';
import {
  InvalidProviderDataError,
  MediaAlreadyExistsError,
  MediaNotFoundInProviderError,
} from '../../../domain/errors/catalog.errors';
import { MediaMother } from '../../../domain/factories/media.factory.test';

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

  it('should return MediaAlreadyExistsError if media already exists', async () => {
    mockRepo.findByProviderId.mockResolvedValue({ id: '123' });
    const command: ImportMediaCommand = {
      mediaId: '123',
      type: MediaType.GAME,
    };

    const result = await handler.execute(command);

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toBeInstanceOf(MediaAlreadyExistsError);
    expect(mockRepo.findByProviderId).toHaveBeenCalledWith('igdb', '123');
    expect(mockIgdb.getMedia).not.toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should route GAME type to IgdbAdapter', async () => {
    const mockMedia = MediaMother.createGame({
      id: asMediaId('123'),
      title: 'Test Game',
      slug: 'test-game',
    });
    mockIgdb.getMedia.mockResolvedValue(mockMedia);
    const command: ImportMediaCommand = {
      mediaId: '123',
      type: MediaType.GAME,
    };

    const result = await handler.execute(command);

    expect(result.isSuccess()).toBe(true);
    expect(result.getValue()).toEqual({
      id: 'generated-uuid',
      slug: 'test-game',
    });
    expect(mockIgdb.getMedia).toHaveBeenCalledWith(
      '123',
      MediaType.GAME,
      'generated-uuid',
    );
    expect(mockRepo.create).toHaveBeenCalledWith(mockMedia);
  });

  it('should route MOVIE type to TmdbAdapter', async () => {
    const mockMedia = MediaMother.createMovie({
      id: asMediaId('456'),
      title: 'Test Movie',
      slug: 'test-movie',
    });
    mockTmdb.getMedia.mockResolvedValue(mockMedia);
    const command: ImportMediaCommand = {
      mediaId: '456',
      type: MediaType.MOVIE,
    };

    const result = await handler.execute(command);

    expect(result.isSuccess()).toBe(true);
    expect(mockTmdb.getMedia).toHaveBeenCalledWith(
      '456',
      MediaType.MOVIE,
      'generated-uuid',
    );
    expect(mockRepo.create).toHaveBeenCalledWith(mockMedia);
  });

  it('should return MediaNotFoundInProviderError if provider returns null', async () => {
    mockIgdb.getMedia.mockResolvedValue(null);
    const command: ImportMediaCommand = {
      mediaId: '404',
      type: MediaType.GAME,
    };

    const result = await handler.execute(command);

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toBeInstanceOf(MediaNotFoundInProviderError);
    expect(mockIgdb.getMedia).toHaveBeenCalled();
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it('should return InvalidProviderDataError without wrapping', async () => {
    mockIgdb.getMedia.mockRejectedValue(
      new InvalidProviderDataError('IGDB', 'Missing name'),
    );
    const command: ImportMediaCommand = {
      mediaId: '999',
      type: MediaType.GAME,
    };

    const result = await handler.execute(command);

    expect(result.isFailure()).toBe(true);
    expect(result.getError()).toBeInstanceOf(InvalidProviderDataError);
  });
});
