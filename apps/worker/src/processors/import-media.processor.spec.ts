import { describe, it, expect, mock } from 'bun:test';
import { processImportMedia } from './import-media.processor';
import { MediaType, ImportMediaHandler } from '@metacult/backend/catalog';
import { Job } from 'bullmq';

describe('Import Media Processor', () => {

    mock.module('@metacult/backend/infrastructure', () => ({
        getDbConnection: () => ({ db: {} }),
        requestContext: {
            run: (_: any, cb: () => any) => cb(),
            get: () => ({ requestId: 'test-id' }),
            getRequestId: () => 'test-id'
        }
    }));

    // Mock Handler
    const mockExecute = mock((command) => Promise.resolve());
    const mockHandler = {
        execute: mockExecute
    } as unknown as ImportMediaHandler;

    it('should route TMDB_MOVIE job to Handler with correct parameters', async () => {
        const job = {
            id: 'job-1',
            data: {
                type: 'movie',
                id: '123' // TMDB ID
            }
        } as unknown as Job;

        await processImportMedia(job as any, { handler: mockHandler });

        expect(mockExecute).toHaveBeenCalled();
        const callArgs = (mockExecute as any).mock.calls[0][0]; // First arg is Command
        expect(callArgs.type).toBe(MediaType.MOVIE);
        expect(callArgs.mediaId).toBe('123');
    });

    it('should route GAME job correctly', async () => {
        const job = {
            id: 'job-2',
            data: {
                type: 'game',
                id: '999'
            }
        } as unknown as Job;

        await processImportMedia(job as any, { handler: mockHandler });

        const callArgs = (mockExecute as any).mock.lastCall[0];
        expect(callArgs.type).toBe(MediaType.GAME);
        expect(callArgs.mediaId).toBe('999');
    });
});
