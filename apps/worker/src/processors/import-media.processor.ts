import { getDbConnection } from '../../../../libs/backend/infrastructure/src/lib/db/client';
import { type ImportJob, IMPORT_QUEUE_NAME } from '../../../../libs/backend/infrastructure/src/lib/queue/queue.client';
// } from '@metacult/backend/infrastructure';
import * as mediaSchema from '@metacult/backend/catalog';
import {
    MediaType,
    DrizzleMediaRepository,
    IgdbProvider,
    TmdbProvider,
    GoogleBooksProvider,
    IgdbAdapter,
    TmdbAdapter,
    GoogleBooksAdapter,
    ImportMediaHandler,
    ImportMediaCommand
} from '@metacult/backend/catalog';
import { Job } from 'bullmq';

export interface ImportMediaProcessorDeps {
    handler?: ImportMediaHandler;
}

export const processImportMedia = async (job: Job<ImportJob>, tokenOrDeps?: string | ImportMediaProcessorDeps) => {
    // Handle DI injection for tests vs BullMQ token
    const deps = typeof tokenOrDeps === 'object' ? tokenOrDeps : undefined;
    const { type } = job.data;

    if (type === 'daily-global-sync') {
        console.log(`🔄 [Worker] Processing Cron Job ${job.id} | Type: ${type} `);
        return;
    }

    const id = (job.data as any).id;
    console.log(`🔄 [Worker] Processing Import Job ${job.id} | Type: ${type} | ID: ${id} `);

    try {
        let handler = deps?.handler;

        if (!handler) {
            console.log('🏭 [Worker] Initializing dependencies...');
            const { db } = getDbConnection(mediaSchema);
            const repository = new DrizzleMediaRepository(db as any);

            // Initialize Providers
            const igdbProvider = new IgdbProvider();
            const tmdbProvider = new TmdbProvider();
            const googleBooksProvider = new GoogleBooksProvider();

            // Wrap in Adapters
            const igdbAdapter = new IgdbAdapter(igdbProvider);
            const tmdbAdapter = new TmdbAdapter(tmdbProvider);
            const googleBooksAdapter = new GoogleBooksAdapter(googleBooksProvider);

            handler = new ImportMediaHandler(
                repository,
                igdbAdapter,
                tmdbAdapter,
                googleBooksAdapter
            );
        }

        let mediaType: MediaType;
        switch (type) {
            case 'game': mediaType = MediaType.GAME; break;
            case 'movie': mediaType = MediaType.MOVIE; break;
            case 'tv': mediaType = MediaType.TV; break;
            case 'book': mediaType = MediaType.BOOK; break;
            default: throw new Error(`Unknown type ${type}`);
        }

        const command = new ImportMediaCommand(id, mediaType);
        await handler.execute(command);

        console.log(`✅ [Worker] Job ${job.id} completed.`);

    } catch (error: any) {
        console.error(`💥 [Error] Failed to process job ${job.id}: `, error.message);
        throw error;
    }
};
