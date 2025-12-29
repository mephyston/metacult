import { describe, it, expect, mock } from 'bun:test';
import { processImportMedia } from './import-media.processor';
import { MediaType } from '@metacult/backend/domain';
import { Job } from 'bullmq';
import { ImportMediaUseCase } from '@metacult/backend/application';

// Mocks are injected via Dependency Injection in the test cases


describe('Import Media Processor', () => {

    it('should route TMDB_MOVIE job to Use Case with correct parameters', async () => {
        // Arrange
        const mockExecute = mock(() => Promise.resolve());
        const mockUseCase = {
            execute: mockExecute
        } as unknown as ImportMediaUseCase;

        const mockJob = {
            id: 'job-1',
            data: {
                type: 'movie',
                id: '123'
            }
        } as unknown as Job;

        // Act
        // Inject the mock use case!
        await processImportMedia(mockJob, { useCase: mockUseCase });

        // Assert
        expect(mockExecute).toHaveBeenCalled();
        expect(mockExecute).toHaveBeenCalledWith({
            type: MediaType.MOVIE,
            sourceId: '123'
        });
    });

    it('should route GAME job correctly', async () => {
        // Arrange
        const mockExecute = mock(() => Promise.resolve());
        const mockUseCase = {
            execute: mockExecute
        } as unknown as ImportMediaUseCase;

        const mockJob = {
            id: 'job-2',
            data: {
                type: 'game',
                id: '999'
            }
        } as unknown as Job;

        // Act
        await processImportMedia(mockJob, { useCase: mockUseCase });

        // Assert
        expect(mockExecute).toHaveBeenCalledWith({
            type: MediaType.GAME,
            sourceId: '999'
        });
    });
});
