import type { Job } from 'bullmq';
import {
    type ImportJob,
    getDbConnection,
    DrizzleMediaRepository
} from '@metacult/backend/infrastructure';
import { MediaType } from '@metacult/backend/domain';
import { ImportMediaUseCase } from '@metacult/backend/application';
import { IgdbAdapter, TmdbAdapter, GoogleBooksAdapter } from '@metacult/backend/infrastructure'; // We'll need to export these

export const processImportMedia = async (job: Job<ImportJob>) => {
    const { type } = job.data;

    // Log context based on job type
    if (type === 'daily-global-sync') {
        console.log(`🔄 [Worker] Processing Cron Job ${job.id} | Type: ${type}`);
        // TODO: Cron implementation
        return;
    }

    const id = (job.data as any).id;
    console.log(`🔄 [Worker] Processing Import Job ${job.id} | Type: ${type} | ID: ${id}`);

    try {
        // 1. Initialize Dependencies (In a real app, DI container does this)
        const { db } = getDbConnection();
        const repository = new DrizzleMediaRepository(db as any);

        const igdbAdapter = new IgdbAdapter();
        const tmdbAdapter = new TmdbAdapter();
        const googleBooksAdapter = new GoogleBooksAdapter();

        // 2. Initialize Use Case
        const useCase = new ImportMediaUseCase(
            repository,
            igdbAdapter,
            tmdbAdapter,
            googleBooksAdapter
        );

        // 3. Execute
        let mediaType: MediaType;
        switch (type) {
            case 'game': mediaType = MediaType.GAME; break;
            case 'movie': mediaType = MediaType.MOVIE; break;
            case 'tv': mediaType = MediaType.TV; break;
            case 'book': mediaType = MediaType.BOOK; break;
            default: throw new Error(`Unknown type ${type}`);
        }

        await useCase.execute({
            type: mediaType,
            sourceId: id
        });

    } catch (error: any) {
        console.error(`💥 [Error] Failed to process job ${job.id}:`, error.message);
        throw error;
    }
};
