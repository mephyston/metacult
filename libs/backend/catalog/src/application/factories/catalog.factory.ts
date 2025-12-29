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
        const igdbProvider = new IgdbProvider();
        const tmdbProvider = new TmdbProvider();
        const googleBooksProvider = new GoogleBooksProvider();

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
}
