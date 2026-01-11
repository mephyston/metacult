import { ImportMediaHandler } from '../../application/commands/import-media/import-media.handler';
import { DrizzleMediaRepository } from '../repositories/drizzle-media.repository';
import { IgdbProvider } from '../providers/igdb.provider';
import { TmdbProvider } from '../providers/tmdb.provider';
import { GoogleBooksProvider } from '../providers/google-books.provider';
import {
  IgdbAdapter,
  TmdbAdapter,
  GoogleBooksAdapter,
} from '../adapters/media.adapters';
import { GetMediaByIdHandler } from '../../application/queries/get-media-by-id/get-media-by-id.handler';
import { GetTopRatedMediaHandler } from '../../application/queries/get-top-rated-media/get-top-rated-media.handler';
import { MediaController } from '../../api/http/controllers/media.controller';
import { SearchMediaHandler } from '../../application/queries/search-media/search-media.handler';
import { GetRecentMediaHandler } from '../../application/queries/get-recent-media/get-recent-media.handler';

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
  static createImportMediaHandler(
    db: any,
    config: CatalogModuleConfig,
  ): ImportMediaHandler {
    // 1. Infrastructure (Persistance)
    const repository = new DrizzleMediaRepository(db);

    // 2. Infrastructure (Adapters Externes)
    // Injection des clés API depuis la configuration
    const igdbProvider = new IgdbProvider(
      config.igdb.clientId,
      config.igdb.clientSecret,
    );
    const tmdbProvider = new TmdbProvider(config.tmdb.apiKey);
    const googleBooksProvider = new GoogleBooksProvider(
      config.googleBooks.apiKey,
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
      googleBooksAdapter,
    );
  }

  /**
   * Crée le Handler de Recherche.
   *
   * @param {any} db - instance Drizzle.
   * @param {CatalogModuleConfig} config - Config.
   * @param {any} redis - Redis client.
   * @returns {SearchMediaHandler}
   */
  static createSearchMediaHandler(
    db: any,
    config: CatalogModuleConfig,
    redis: any,
  ): SearchMediaHandler {
    const repository = new DrizzleMediaRepository(db);

    // Re-creating adapters here (stateless).
    // In a real DI container this would be singleton.
    const igdbProvider = new IgdbProvider(
      config.igdb.clientId,
      config.igdb.clientSecret,
    );
    const tmdbProvider = new TmdbProvider(config.tmdb.apiKey);
    const googleBooksProvider = new GoogleBooksProvider(
      config.googleBooks.apiKey,
    );

    const igdbAdapter = new IgdbAdapter(igdbProvider);
    const tmdbAdapter = new TmdbAdapter(tmdbProvider);
    const googleBooksAdapter = new GoogleBooksAdapter(googleBooksProvider);

    return new SearchMediaHandler(
      repository,
      redis,
      igdbAdapter,
      tmdbAdapter,
      googleBooksAdapter,
    );
  }

  /**
   * Crée le Contrôleur HTTP (pour Elysia).
   * Assemble tous les Handlers.
   *
   * @param {any} db - instance Drizzle.
   * @param {CatalogModuleConfig} config - Config.
   * @param {any} redis - Redis Client.
   * @returns {MediaController}
   */
  /**
   * Crée le Handler de Médias Récents.
   *
   * @param {any} db - instance Drizzle.
   * @param {any} redis - Redis Client.
   * @returns {GetRecentMediaHandler}
   */
  static createGetRecentMediaHandler(
    db: any,
    redis: any,
  ): GetRecentMediaHandler {
    const repository = new DrizzleMediaRepository(db);
    return new GetRecentMediaHandler(repository, redis);
  }

  static createGetMediaByIdHandler(db: any, redis: any): GetMediaByIdHandler {
    const repository = new DrizzleMediaRepository(db);
    return new GetMediaByIdHandler(repository, redis);
  }

  static createGetTopRatedMediaHandler(
    db: any,
    redis: any,
  ): GetTopRatedMediaHandler {
    const repository = new DrizzleMediaRepository(db);
    return new GetTopRatedMediaHandler(repository, redis);
  }

  /**
   * Crée le Contrôleur HTTP (pour Elysia).
   * Assemble tous les Handlers.
   *
   * @param {any} db - instance Drizzle.
   * @param {CatalogModuleConfig} config - Config.
   * @param {any} redis - Redis Client.
   * @returns {MediaController}
   */
  static createController(
    db: any,
    config: CatalogModuleConfig,
    redis: any,
  ): MediaController {
    return new MediaController(
      this.createSearchMediaHandler(db, config, redis),
      this.createImportMediaHandler(db, config),
      this.createGetRecentMediaHandler(db, redis),
      this.createGetMediaByIdHandler(db, redis),
      this.createGetTopRatedMediaHandler(db, redis),
    );
  }
}
