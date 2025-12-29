import { describe, it, expect, mock } from 'bun:test';
import { ImportMediaUseCase } from './import-media.use-case';
import { MediaType } from '@metacult/backend/domain';
import type { IMediaRepository, IMediaProvider, Media } from '@metacult/backend/domain';

describe('ImportMediaUseCase', () => {

    it('should fetch data from provider and save to repository (Success Scenario)', async () => {
        // Arrange
        const mockMediaEntity = {
            id: '123',
            title: 'Mock Game',
            type: MediaType.GAME
        } as Media;

        // Explicit mocks for this test
        const mockRepoCreate = mock(async () => { });
        const mockGameProviderGet = mock(async () => mockMediaEntity);

        const mockRepository = { create: mockRepoCreate } as unknown as IMediaRepository;
        const mockGameProvider = { getMedia: mockGameProviderGet } as unknown as IMediaProvider;
        const mockMovieProvider = { getMedia: mock(async () => null) } as unknown as IMediaProvider;
        const mockBookProvider = { getMedia: mock(async () => null) } as unknown as IMediaProvider;

        const useCase = new ImportMediaUseCase(
            mockRepository,
            mockGameProvider,
            mockMovieProvider,
            mockBookProvider
        );

        const command = {
            type: MediaType.GAME,
            sourceId: 'game-123'
        };

        // Act
        await useCase.execute(command);

        // Assert
        expect(mockGameProviderGet).toHaveBeenCalledWith('game-123', MediaType.GAME);
        expect(mockRepoCreate).toHaveBeenCalledWith(mockMediaEntity);
    });

    it('should propagate errors when provider fails (Failure Scenario)', async () => {
        // Arrange
        const error = new Error('API Rate Limit');
        const mockGameProviderGet = mock(async () => { throw error; });

        const mockRepository = { create: mock(async () => { }) } as unknown as IMediaRepository;
        const mockGameProvider = { getMedia: mockGameProviderGet } as unknown as IMediaProvider;
        // Others irrelevant
        const useCase = new ImportMediaUseCase(
            mockRepository,
            mockGameProvider,
            {} as any,
            {} as any
        );

        const command = {
            type: MediaType.GAME,
            sourceId: 'game-123'
        };

        // Act & Assert
        // Using explicit try/catch to be safe with Bun assertions
        try {
            await useCase.execute(command);
            // If we reach here, it failed
            expect(true).toBe(false);
        } catch (e: any) {
            expect(e.message).toBe('API Rate Limit');
        }
    });

    it('should do nothing if provider returns null (Graceful Fail)', async () => {
        // Arrange
        const mockRepoCreate = mock(async () => { });
        const mockMovieProviderGet = mock(async () => null);

        const mockRepository = { create: mockRepoCreate } as unknown as IMediaRepository;
        const mockMovieProvider = { getMedia: mockMovieProviderGet } as unknown as IMediaProvider;

        const useCase = new ImportMediaUseCase(
            mockRepository,
            {} as any,
            mockMovieProvider,
            {} as any
        );

        const command = {
            type: MediaType.MOVIE,
            sourceId: 'movie-456'
        };

        // Act
        await useCase.execute(command);

        // Assert
        expect(mockMovieProviderGet).toHaveBeenCalled();
        expect(mockRepoCreate).not.toHaveBeenCalled();
    });
});
