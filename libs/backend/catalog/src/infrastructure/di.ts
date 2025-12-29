import { DrizzleMediaRepository } from './repositories/drizzle-media.repository';
import { IgdbProvider } from './providers/igdb.provider';
import { TmdbProvider } from './providers/tmdb.provider';
import { GoogleBooksProvider } from './providers/google-books.provider';
import { SearchMediaHandler } from '../application/queries/search-media/search-media.handler';
import { ImportMediaHandler } from '../application/commands/import-media/import-media.handler';
import { MediaController } from '../api/http/controllers/media.controller';
import { getDbConnection, redisClient } from '@metacult/backend/infrastructure';
import * as mediaSchema from './db/media.schema';

// 1. Infrastructure (Driven Adapters)
// Use the singleton DB connection. We assume it's initialized by the app entry point.
// We cast to 'any' or specific schema type because the global instance might have a merged schema.
const { db } = getDbConnection();

const mediaRepository = new DrizzleMediaRepository(db as any);

const igdbProvider = new IgdbProvider(
    process.env.IGDB_CLIENT_ID || '',
    process.env.IGDB_CLIENT_SECRET || ''
);

const tmdbProvider = new TmdbProvider(
    process.env.TMDB_API_KEY || ''
);

const googleBooksProvider = new GoogleBooksProvider(
    process.env.GOOGLE_BOOKS_API_KEY || ''
);

// 2. Application (Use Cases/Handlers)
const searchHandler = new SearchMediaHandler(mediaRepository);
const importHandler = new ImportMediaHandler(
    mediaRepository,
    igdbProvider,
    tmdbProvider,
    googleBooksProvider
);

// 3. Interface Adapters (Driving Adapters)
// Inject handlers into Controller
export const mediaController = new MediaController(searchHandler, importHandler);
