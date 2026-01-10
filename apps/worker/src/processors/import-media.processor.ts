import {
  requestContext,
  importQueue,
  getDbConnection,
  logger,
  type ImportJob,
} from '@metacult/backend-infrastructure';
import * as mediaSchema from '@metacult/backend-catalog';
import {
  MediaType,
  ImportMediaHandler,
  ImportMediaCommand,
  CatalogModuleFactory,
  TmdbProvider,
  IgdbProvider,
  GoogleBooksProvider,
  MediaAlreadyExistsError,
  InvalidProviderDataError,
  MediaNotFoundInProviderError,
} from '@metacult/backend-catalog';
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
      logger.info({ jobId: job.id, type }, '[Worker] Processing Cron Job');

      const config = {
        igdb: {
          clientId: process.env.IGDB_CLIENT_ID || '',
          clientSecret: process.env.IGDB_CLIENT_SECRET || '',
        },
        tmdb: { apiKey: process.env.TMDB_API_KEY || '' },
        googleBooks: { apiKey: process.env.GOOGLE_BOOKS_API_KEY || '' },
      };

      logger.debug(
        {
          hasIgdb: !!config.igdb.clientId,
          hasTmdb: !!config.tmdb.apiKey,
          hasBooks: !!config.googleBooks.apiKey,
        },
        '[Worker] Config loaded',
      );

      try {
        // 1. Queue Access (imported statically)

        // 2. Instantiate Providers with Config
        logger.debug('[Worker] Instantiating Providers');
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
          logger.info('[Worker] Fetching TMDB Trending');
          try {
            const tmdbResults = await tmdb.fetchTrending();
            logger.info(
              { count: tmdbResults.length },
              '[Sync] Found trending items from TMDB',
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
            logger.error({ err: e }, '[Worker] TMDB Fetch Failed');
          }
        } else {
          logger.warn('[Worker] TMDB API Key missing - skipping');
        }

        // IGDB
        if (config.igdb.clientId) {
          logger.info('🔍 [Worker] Fetching IGDB Trending...');
          try {
            const igdbResults = await igdb.fetchTrending();
            logger.info(
              { count: igdbResults.length },
              '📊 [Sync] Found trending items from IGDB',
            );
            for (const item of igdbResults) {
              await importQueue.add('import-trending-item', {
                type: 'game',
                id: item.id.toString(),
                requestId: currentRequestId,
              });
            }
          } catch (e: any) {
            logger.error({ err: e }, '❌ [Worker] IGDB Fetch Failed');
          }
        } else {
          logger.warn('⚠️ [Worker] IGDB Credentials missing, skipping.');
        }

        // Google Books
        if (config.googleBooks.apiKey) {
          logger.info('🔍 [Worker] Fetching Google Books Trending...');
          try {
            const booksResults = await googleBooks.fetchTrending();
            logger.info(
              { count: booksResults.length },
              '📊 [Sync] Found trending items from Google Books',
            );
            for (const item of booksResults) {
              await importQueue.add('import-trending-item', {
                type: 'book',
                id: item.id,
                requestId: currentRequestId,
              });
            }
          } catch (e: any) {
            logger.error({ err: e }, '❌ [Worker] Books Fetch Failed');
          }
        } else {
          logger.warn('⚠️ [Worker] Google Books API Key missing, skipping.');
        }

        logger.info('✅ [Worker] Daily Global Sync completed successfully.');
      } catch (err: any) {
        logger.error(
          { err },
          '💥 [Worker] Critical Error in Daily Global Sync',
        );
      }

      return;
    }

    // --- STANDARD IMPORT LOGIC ---

    if ((type as string) === 'daily-global-sync') return;
    const { id } = job.data;
    logger.info({ jobId: job.id, type, id }, '[Worker] Processing Import Job');

    try {
      let handler = deps?.handler;

      if (!handler) {
        logger.debug('[Worker] Initializing dependencies via Factory');
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

      logger.info({ jobId: job.id }, '[Worker] Job completed successfully');
    } catch (error: any) {
      if (error instanceof MediaAlreadyExistsError) {
        logger.warn(
          { jobId: job.id, message: error.message },
          '[Worker] Job skipped (Duplicate)',
        );
        return;
      }

      if (
        error instanceof InvalidProviderDataError ||
        error instanceof MediaNotFoundInProviderError
      ) {
        logger.error(
          // Changed from WARN to ERROR as per request
          { jobId: job.id, err: error },
          '[Worker] Job skipped (Invalid Data / Not Found)',
        );
        return; // Do NOT rethrow -> Marks job as Completed (but effectively skipped/failed) to prevent Retries
      }

      logger.error(
        { jobId: job.id, err: error },
        '[Worker] Failed to process job',
      );
      throw error;
    }
  });
};
