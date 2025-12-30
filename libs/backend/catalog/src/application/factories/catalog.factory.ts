import { ImportMediaHandler } from '../commands/import-media/import-media.handler';
import { DrizzleMediaRepository } from '../../infrastructure/repositories/drizzle-media.repository';
import { IgdbProvider } from '../../infrastructure/providers/igdb.provider';
import { TmdbProvider } from '../../infrastructure/providers/tmdb.provider';
import { GoogleBooksProvider } from '../../infrastructure/providers/google-books.provider';
import { IgdbAdapter, TmdbAdapter, GoogleBooksAdapter } from '../../infrastructure/adapters/media.adapters';

export class CatalogModuleFactory {
    static createImportMediaHandler(db: any): ImportMediaHandler {
        const repository = new DrizzleMediaRepository(db);

        // Initialize Providers
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

        // Wrap in Adapters
        const igdbAdapter = new IgdbAdapter(igdbProvider);
        const tmdbAdapter = new TmdbAdapter(tmdbProvider);
        const googleBooksAdapter = new GoogleBooksAdapter(googleBooksProvider);

        return new ImportMediaHandler(
            repository,
            igdbAdapter,
            tmdbAdapter,
            googleBooksAdapter
        );
    }

    static createSearchMediaHandler(db: any): SearchMediaHandler {
        const repository = new DrizzleMediaRepository(db);
        return new SearchMediaHandler(repository);
    }

    static createController(db: any): MediaController {
        return new MediaController(
            this.createSearchMediaHandler(db),
            this.createImportMediaHandler(db)
        );
    }
}
import { MediaController } from '../../api/http/controllers/media.controller';
import { SearchMediaHandler } from '../queries/search-media/search-media.handler';
