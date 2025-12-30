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
            console.log('🏭 [Worker] Initialisation des dépendances via la Factory...');
            const { db } = getDbConnection(mediaSchema);

            // Validation des variables d'environnement
            if (!process.env.IGDB_CLIENT_ID || !process.env.TMDB_API_KEY) {
                console.warn('⚠️ [Worker] Credentials API manquants. Les imports risquent d\'échouer.');
            }

            // Création de la Configuration
            const config = {
                igdb: {
                    clientId: process.env.IGDB_CLIENT_ID || '',
                    clientSecret: process.env.IGDB_CLIENT_SECRET || '',
                },
                tmdb: {
                    apiKey: process.env.TMDB_API_KEY || '',
                },
                googleBooks: {
                    apiKey: process.env.GOOGLE_BOOKS_API_KEY || '',
                }
            };

            // ✅ PRINCIPE: Inversion de Contrôle (IoC)
            // Le Worker (Interface Layer) utilise la Factory pour obtenir une instance du Handler
            // entièrement configurée (avec Repository et Adapters injectés).
            // Le Worker ne connaît pas les détails d'implémentation (DB, API externes).
            handler = CatalogModuleFactory.createImportMediaHandler(db, config);
        }

        let mediaType: MediaType;
        switch (type) {
            case 'game': mediaType = MediaType.GAME; break;
            case 'movie': mediaType = MediaType.MOVIE; break;
            case 'tv': mediaType = MediaType.TV; break;
            case 'book': mediaType = MediaType.BOOK; break;
            default: throw new Error(`Unknown type ${type}`);
        }

        // ✅ PRINCIPE: Command Pattern
        // Transformation de la requête brute du Job en une Commande d'Application (DTO).
        // Cela découple le Worker (BullMQ) du code métier.
        const command = new ImportMediaCommand(id, mediaType);

        // Exécution de la logique métier via le Handler
        await handler.execute(command);

        console.log(`✅ [Worker] Job ${job.id} terminé avec succès.`);

    } catch (error: any) {
        console.error(`💥 [Error] Failed to process job ${job.id}: `, error.message);
        throw error;
    }
};
