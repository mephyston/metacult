import {
  requestContext,
  importQueue,
  getDbConnection,
  type ImportJob,
} from '@metacult/backend/infrastructure';
import * as mediaSchema from '@metacult/backend/catalog';
import {
  MediaType,
  ImportMediaHandler,
  ImportMediaCommand,
  CatalogModuleFactory,
  TmdbProvider,
  IgdbProvider,
  GoogleBooksProvider,
  MediaAlreadyExistsError,
} from '@metacult/backend/catalog';
import { Job } from 'bullmq';

export interface ImportMediaProcessorDeps {
  handler?: ImportMediaHandler;
}

export const processImportMedia = async (
  job: Job<ImportJob>,
  tokenOrDeps?: string | ImportMediaProcessorDeps,
) => {
  // Handle DI injection for tests vs BullMQ token
  const deps = typeof tokenOrDeps === 'object' ? tokenOrDeps : undefined;
  const { type } = job.data;

  // --- TRACING WRAPPER ---
  const requestId = job.data.requestId || crypto.randomUUID();

  return requestContext.run({ requestId }, async () => {
    // --- DAILY SYNC LOGIC ---
    if (type === 'daily-global-sync') {
      console.log(`🔄 [Worker] Processing Cron Job ${job.id} | Type: ${type} `);

      const config = {
        igdb: {
          clientId: process.env.IGDB_CLIENT_ID || '',
          clientSecret: process.env.IGDB_CLIENT_SECRET || '',
        },
        tmdb: { apiKey: process.env.TMDB_API_KEY || '' },
        googleBooks: { apiKey: process.env.GOOGLE_BOOKS_API_KEY || '' },
      };

      console.log('🔧 [Worker] Config loaded:', {
        hasIgdb: !!config.igdb.clientId,
        hasTmdb: !!config.tmdb.apiKey,
        hasBooks: !!config.googleBooks.apiKey,
      });

      try {
        // 1. Queue Access (imported statically)

        // 2. Instantiate Providers with Config
        console.log('🏭 [Worker] Instantiating Providers...');
        const tmdb = new TmdbProvider(config.tmdb.apiKey);
        const igdb = new IgdbProvider(
          config.igdb.clientId,
          config.igdb.clientSecret,
        );
        const googleBooks = new GoogleBooksProvider(config.googleBooks.apiKey);

        // 3. Fetch & Dispatch
        // Request context is already available via static import but we need the instance from async context?
        // No, requestContext is an AsyncLocalStorage instance exported from infrastructure.
        // We typically use methods on it.
        // In the original code: const { requestContext: workerRequestContext } = ...
        // Wait, typically requestContext is a singleton.
        // The dynamic import returned the module.
        // The static import returns the named exports.

        const currentRequestId = requestContext.getRequestId();

        // TMDB
        if (config.tmdb.apiKey) {
          console.log('🔍 [Worker] Fetching TMDB Trending...');
          try {
            const tmdbResults = await tmdb.fetchTrending();
            console.log(
              `📊 [Sync] Found ${tmdbResults.length} trending items from TMDB`,
            );
            for (const item of tmdbResults) {
              const mediaType =
                (item as any).media_type === 'movie'
                  ? MediaType.MOVIE
                  : MediaType.TV;
              await importQueue.add('import-trending-item', {
                type: mediaType === MediaType.MOVIE ? 'movie' : 'tv',
                id: item.id.toString(),
                requestId: currentRequestId,
              });
            }
          } catch (e: any) {
            console.error('❌ [Worker] TMDB Fetch Failed:', e.message);
          }
        } else {
          console.log('⚠️ [Worker] TMDB API Key missing, skipping.');
        }

        // IGDB
        if (config.igdb.clientId) {
          console.log('🔍 [Worker] Fetching IGDB Trending...');
          try {
            const igdbResults = await igdb.fetchTrending();
            console.log(
              `📊 [Sync] Found ${igdbResults.length} trending items from IGDB`,
            );
            for (const item of igdbResults) {
              await importQueue.add('import-trending-item', {
                type: 'game',
                id: item.id.toString(),
                requestId: currentRequestId,
              });
            }
          } catch (e: any) {
            console.error('❌ [Worker] IGDB Fetch Failed:', e.message);
          }
        } else {
          console.log('⚠️ [Worker] IGDB Credentials missing, skipping.');
        }

        // Google Books
        if (config.googleBooks.apiKey) {
          console.log('🔍 [Worker] Fetching Google Books Trending...');
          try {
            const booksResults = await googleBooks.fetchTrending();
            console.log(
              `📊 [Sync] Found ${booksResults.length} trending items from Google Books`,
            );
            for (const item of booksResults) {
              await importQueue.add('import-trending-item', {
                type: 'book',
                id: item.id,
                requestId: currentRequestId,
              });
            }
          } catch (e: any) {
            console.error('❌ [Worker] Books Fetch Failed:', e.message);
          }
        } else {
          console.log('⚠️ [Worker] Google Books API Key missing, skipping.');
        }

        console.log('✅ [Worker] Daily Global Sync completed successfully.');
      } catch (err: any) {
        console.error('💥 [Worker] Critical Error in Daily Global Sync:', err);
      }

      return;
    }

    // --- STANDARD IMPORT LOGIC ---

    if ((type as string) === 'daily-global-sync') return;
    const { id } = job.data;
    console.log(
      `🔄 [Worker] Processing Import Job ${job.id} | Type: ${type} | ID: ${id} `,
    );

    try {
      let handler = deps?.handler;

      if (!handler) {
        console.log(
          '🏭 [Worker] Initialisation des dépendances via la Factory...',
        );
        const { db } = getDbConnection(mediaSchema);

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
          },
        };

        handler = CatalogModuleFactory.createImportMediaHandler(db, config);
      }

      let mediaType: MediaType;
      switch (type) {
        case 'game':
          mediaType = MediaType.GAME;
          break;
        case 'movie':
          mediaType = MediaType.MOVIE;
          break;
        case 'tv':
          mediaType = MediaType.TV;
          break;
        case 'book':
          mediaType = MediaType.BOOK;
          break;
        default:
          throw new Error(`Unknown type ${type}`);
      }

      const command = new ImportMediaCommand(id, mediaType);
      await handler.execute(command);

      console.log(`✅ [Worker] Job ${job.id} terminé avec succès.`);
    } catch (error: any) {
      if (error instanceof MediaAlreadyExistsError) {
        console.warn(
          `ℹ️ [Worker] Job ${job.id} skipped (Duplicate): ${error.message}`,
        );
        return;
      }

      console.error(
        `💥 [Error] Failed to process job ${job.id}: `,
        error.message,
      );
      throw error;
    }
  });
};
