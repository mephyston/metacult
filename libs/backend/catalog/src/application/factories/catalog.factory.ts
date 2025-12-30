import { ImportMediaHandler } from '../commands/import-media/import-media.handler';
import { DrizzleMediaRepository } from '../../infrastructure/repositories/drizzle-media.repository';
import { IgdbProvider } from '../../infrastructure/providers/igdb.provider';
import { TmdbProvider } from '../../infrastructure/providers/tmdb.provider';
import { GoogleBooksProvider } from '../../infrastructure/providers/google-books.provider';
import { IgdbAdapter, TmdbAdapter, GoogleBooksAdapter } from '../../infrastructure/adapters/media.adapters';

// ✅ Configuration injectée (pas d'accès direct à process.env)
export interface CatalogModuleConfig {
    igdb: {
        clientId: string;
        clientSecret: string;
    };
    tmdb: {
        apiKey: string;
    };
    googleBooks: {
        apiKey: string;
    };
}

export class CatalogModuleFactory {
    static createImportMediaHandler(db: any, config: CatalogModuleConfig): ImportMediaHandler {
        const repository = new DrizzleMediaRepository(db);

        // ✅ Initialize Providers with injected credentials
        const igdbProvider = new IgdbProvider(
            config.igdb.clientId,
            config.igdb.clientSecret
        );
        const tmdbProvider = new TmdbProvider(
            config.tmdb.apiKey
        );
        const googleBooksProvider = new GoogleBooksProvider(
            config.googleBooks.apiKey
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

    static createController(db: any, config: CatalogModuleConfig): MediaController {
        return new MediaController(
            this.createSearchMediaHandler(db),
            this.createImportMediaHandler(db, config)
        );
    }
}
import { MediaController } from '../../api/http/controllers/media.controller';
import { SearchMediaHandler } from '../queries/search-media/search-media.handler';
