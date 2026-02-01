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
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as mediaSchema from '../db/media.schema';
import type { Redis } from 'ioredis';

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
    db: NodePgDatabase<Record<string, unknown>>,
    config: CatalogModuleConfig,
  ): ImportMediaHandler {
    const repository = this.createRepository(db);
    const { igdbAdapter, tmdbAdapter, googleBooksAdapter } =
      this.createAdapters(config);

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
   * @param {NodePgDatabase<Record<string, unknown>>} db - instance Drizzle.
   * @param {CatalogModuleConfig} config - Config.
   * @param {Redis} redis - Redis client.
   * @returns {SearchMediaHandler}
   */
  static createSearchMediaHandler(
    db: NodePgDatabase<Record<string, unknown>>,
    config: CatalogModuleConfig,
    redis: Redis,
  ): SearchMediaHandler {
    const repository = this.createRepository(db);
    const { igdbAdapter, tmdbAdapter, googleBooksAdapter } =
      this.createAdapters(config);

    return new SearchMediaHandler(
      repository,
      redis,
      igdbAdapter,
      tmdbAdapter,
      googleBooksAdapter,
    );
  }

  // --- Private Helpers ---

  private static createRepository(db: NodePgDatabase<Record<string, unknown>>) {
    return new DrizzleMediaRepository(
      db as unknown as NodePgDatabase<typeof mediaSchema>,
    );
  }

  private static createAdapters(config: CatalogModuleConfig) {
    const igdbProvider = new IgdbProvider(
      config.igdb.clientId,
      config.igdb.clientSecret,
    );
    const tmdbProvider = new TmdbProvider(config.tmdb.apiKey);
    const googleBooksProvider = new GoogleBooksProvider(
      config.googleBooks.apiKey,
    );

    return {
      igdbAdapter: new IgdbAdapter(igdbProvider),
      tmdbAdapter: new TmdbAdapter(tmdbProvider),
      googleBooksAdapter: new GoogleBooksAdapter(googleBooksProvider),
    };
  }

  /**
   * Crée le Contrôleur HTTP (pour Elysia).
   * Assemble tous les Handlers.
   *
   * @param {NodePgDatabase<Record<string, unknown>>} db - instance Drizzle.
   * @param {CatalogModuleConfig} config - Config.
   * @param {Redis} redis - Redis Client.
   * @returns {MediaController}
   */
  /**
   * Crée le Handler de Médias Récents.
   *
   * @param {NodePgDatabase<Record<string, unknown>>} db - instance Drizzle.
   * @param {Redis} redis - Redis Client.
   * @returns {GetRecentMediaHandler}
   */
  static createGetRecentMediaHandler(
    db: NodePgDatabase<Record<string, unknown>>,
    redis: Redis,
  ): GetRecentMediaHandler {
    const repository = new DrizzleMediaRepository(
      db as unknown as NodePgDatabase<typeof mediaSchema>,
    );
    return new GetRecentMediaHandler(repository, redis);
  }

  static createGetMediaByIdHandler(
    db: NodePgDatabase<Record<string, unknown>>,
    redis: Redis,
  ): GetMediaByIdHandler {
    const repository = new DrizzleMediaRepository(
      db as unknown as NodePgDatabase<typeof mediaSchema>,
    );
    return new GetMediaByIdHandler(repository, redis);
  }

  static createGetTopRatedMediaHandler(
    db: NodePgDatabase<Record<string, unknown>>,
    redis: Redis,
  ): GetTopRatedMediaHandler {
    const repository = new DrizzleMediaRepository(
      db as unknown as NodePgDatabase<typeof mediaSchema>,
    );
    return new GetTopRatedMediaHandler(repository, redis);
  }

  /**
   * Crée le Contrôleur HTTP (pour Elysia).
   * Assemble tous les Handlers.
   *
   * @param {NodePgDatabase<Record<string, unknown>>} db - instance Drizzle.
   * @param {CatalogModuleConfig} config - Config.
   * @param {Redis} redis - Redis Client.
   * @returns {MediaController}
   */
  static createController(
    db: NodePgDatabase<Record<string, unknown>>,
    config: CatalogModuleConfig,
    redis: Redis,
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
