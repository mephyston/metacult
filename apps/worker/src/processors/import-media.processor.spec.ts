import { describe, it, expect, mock } from 'bun:test';
import { processImportMedia } from './import-media.processor';
import { MediaType } from '@metacult/backend/domain';
import { Job } from 'bullmq';
import { ImportMediaUseCase } from '@metacult/backend/application';

// Mock Infrastructure Dependencies (Still needed for the 'new' calls inside processor if we fall back, 
// but we are injecting the UseCase so the real one isn't created.
// HOWEVER, the processor still instantiates Repository/Adapters *before* checking deps.useCase?
// Let's check the code. Yes, step 1 (Infrastructure) happens before Step 2 (Use Case).
// So we still need to mock infrastructure to avoid real DB connections.)

mock.module('@metacult/backend/infrastructure', () => ({
    getDbConnection: () => ({ db: {} }),
    DrizzleMediaRepository: class MockRepo { },
    IgdbAdapter: class MockIgdb { },
    TmdbAdapter: class MockTmdb { },
    GoogleBooksAdapter: class MockBooks { },
}));

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
