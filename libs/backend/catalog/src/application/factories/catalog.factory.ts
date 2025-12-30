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
    // ✅ CONFIGURATION: Injectée explicitement (composition root)
    // Permet de valider la config au démarrage et facilite les tests.

    /**
     * Crée le Handler d'Import de Médias.
     * Configure et injecte les Adapters (IGDB, TMDB, etc.) et le Repository Drizzle.
     * 
     * @param {any} db - instance Drizzle.
     * @param {CatalogModuleConfig} config - Clés API.
     * @returns {ImportMediaHandler} Handler prêt à l'emploi.
     */
    static createImportMediaHandler(db: any, config: CatalogModuleConfig): ImportMediaHandler {
        // 1. Infrastructure (Persistance)
        const repository = new DrizzleMediaRepository(db);

        // 2. Infrastructure (Adapters Externes)
        // Injection des clés API depuis la configuration
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

        // Pattern Adapter: On encapsule les providers pour respecter l'interface du Domaine
        const igdbAdapter = new IgdbAdapter(igdbProvider);
        const tmdbAdapter = new TmdbAdapter(tmdbProvider);
        const googleBooksAdapter = new GoogleBooksAdapter(googleBooksProvider);

        // 3. Application (Handler)
        // Injection de toutes les dépendances nécessaires
        return new ImportMediaHandler(
            repository,
            igdbAdapter,
            tmdbAdapter,
            googleBooksAdapter
        );
    }

    /**
     * Crée le Handler de Recherche.
     * 
     * @param {any} db - instance Drizzle.
     * @returns {SearchMediaHandler}
     */
    static createSearchMediaHandler(db: any): SearchMediaHandler {
        const repository = new DrizzleMediaRepository(db);
        return new SearchMediaHandler(repository);
    }

    /**
     * Crée le Contrôleur HTTP (pour Elysia).
     * Assemble tous les Handlers.
     * 
     * @param {any} db - instance Drizzle.
     * @param {CatalogModuleConfig} config - Config.
     * @returns {MediaController}
     */
    static createController(db: any, config: CatalogModuleConfig): MediaController {
        return new MediaController(
            this.createSearchMediaHandler(db),
            this.createImportMediaHandler(db, config)
        );
    }
}
import { MediaController } from '../../api/http/controllers/media.controller';
import { SearchMediaHandler } from '../queries/search-media/search-media.handler';
