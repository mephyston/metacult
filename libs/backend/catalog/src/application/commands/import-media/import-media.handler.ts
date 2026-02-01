import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { IMediaProvider } from '../../ports/media-provider.interface';
import type { ImportMediaCommand } from './import-media.command';
import { MediaType } from '../../../domain/entities/media.entity';
import { MediaImportPolicy } from '../../../domain/services/media-import.policy';
import {
  MediaNotFoundInProviderError,
  ProviderUnavailableError,
  UnsupportedMediaTypeError,
  InvalidProviderDataError,
  MediaAlreadyExistsError,
} from '../../../domain/errors/catalog.errors';
import { Result, ProviderSource, type AppError } from '@metacult/shared-core';
import { logger } from '@metacult/backend-infrastructure';

interface ImportResult {
  id: string;
  slug: string;
}

/**
 * Cas d'Utilisation (Use Case) : Importer un média externe.
 * Orchestre les interactions entre le Domaine, les Providers externes et le Repository.
 *
 * @class ImportMediaHandler
 */
export class ImportMediaHandler {
  private readonly importPolicy: MediaImportPolicy;
  private readonly providers: Partial<
    Record<MediaType, { adapter: IMediaProvider; name: ProviderSource }>
  >;

  /**
   * @param {IMediaRepository} mediaRepository - Port pour la persistance.
   * @param {IMediaProvider} igdbAdapter - Adapter pour les jeux (IGDB).
   * @param {IMediaProvider} tmdbAdapter - Adapter pour films/séries (TMDB).
   * @param {IMediaProvider} googleBooksAdapter - Adapter pour les livres (Google Books).
   */
  constructor(
    private readonly mediaRepository: IMediaRepository,
    private readonly igdbAdapter: IMediaProvider,
    private readonly tmdbAdapter: IMediaProvider,
    private readonly googleBooksAdapter: IMediaProvider,
  ) {
    this.importPolicy = new MediaImportPolicy(mediaRepository);
    this.providers = {
      [MediaType.GAME]: {
        adapter: this.igdbAdapter,
        name: ProviderSource.IGDB,
      },
      [MediaType.MOVIE]: {
        adapter: this.tmdbAdapter,
        name: ProviderSource.TMDB,
      },
      [MediaType.TV]: { adapter: this.tmdbAdapter, name: ProviderSource.TMDB },
      [MediaType.BOOK]: {
        adapter: this.googleBooksAdapter,
        name: ProviderSource.GOOGLE_BOOKS,
      },
    };
  }

  /**
   * Exécute la logique d'importation.
   *
   * 1. Vérifie si le média existe déjà (Politique de Domaine).
   * 2. Récupère les métadonnées depuis le bon Provider.
   * 3. Persiste le nouveau média.
   *
   * @param {ImportMediaCommand} command - Les données de la commande.
   * @returns {Promise<Result<ImportResult>>} Result contenant l'UUID et le Slug ou une erreur.
   */
  async execute(command: ImportMediaCommand): Promise<Result<ImportResult>> {
    const { mediaId, type } = command;

    const providerConfig = this.providers[type];
    if (!providerConfig) {
      return Result.fail(new UnsupportedMediaTypeError(type));
    }
    const { adapter, name: providerName } = providerConfig;

    logger.info(
      { type, mediaId, provider: providerName },
      '[ImportMediaHandler] Processing import',
    );

    // 1. Validation Domaine via Domain Service
    logger.debug('[ImportMediaHandler] Step 1: Domain Validation');
    try {
      await this.importPolicy.validateImport(providerName, mediaId);
    } catch (error) {
      if (error instanceof MediaAlreadyExistsError) {
        return Result.fail(error);
      }
      throw error; // Unexpected error
    }

    // 2. Orchestration Infrastructure (Récupération Données)
    logger.debug('[ImportMediaHandler] Step 2: Fetching from Provider');

    let media;
    const newId = this.mediaRepository.nextId();

    try {
      media = await adapter.getMedia(mediaId, type, newId);
    } catch (error) {
      if (
        error instanceof UnsupportedMediaTypeError ||
        error instanceof InvalidProviderDataError
      ) {
        return Result.fail(error);
      }
      logger.error(
        { err: error, type, mediaId },
        '[ImportMediaHandler] Provider error',
      );
      return Result.fail(
        new ProviderUnavailableError(
          providerName,
          error instanceof Error ? error : new Error(String(error)),
        ),
      );
    }

    // 3. Validation de l'existence
    if (!media) {
      logger.warn(
        { providerName, mediaId },
        '[ImportMediaHandler] Media not found in provider',
      );
      return Result.fail(
        new MediaNotFoundInProviderError(providerName, mediaId),
      );
    }

    // 4. Persistance
    logger.debug('[ImportMediaHandler] Step 3: Persisting to Repository');
    await this.mediaRepository.create(media);
    logger.info(
      { title: media.title, id: newId },
      '[ImportMediaHandler] Import successful',
    );

    return Result.ok({ id: newId, slug: media.slug });
  }
}
