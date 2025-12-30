import { getDbConnection, type ImportJob, IMPORT_QUEUE_NAME } from '@metacult/backend/infrastructure';
import * as mediaSchema from '@metacult/backend/catalog';
import {
    MediaType,
    ImportMediaHandler,
    ImportMediaCommand,
    CatalogModuleFactory // Import Factory
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
            console.log('🏭 [Worker] Initializing dependencies via Factory...');
            const { db } = getDbConnection(mediaSchema);
            // Use Factory to create handler
            handler = CatalogModuleFactory.createImportMediaHandler(db);
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
