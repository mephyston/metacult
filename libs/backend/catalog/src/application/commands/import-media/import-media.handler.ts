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
} from '../../../domain/errors/catalog.errors';
import { logger } from '@metacult/backend-infrastructure';

/**
 * Cas d'Utilisation (Use Case) : Importer un média externe.
 * Orchestre les interactions entre le Domaine, les Providers externes et le Repository.
 *
 * @class ImportMediaHandler
 */
export class ImportMediaHandler {
  private readonly importPolicy: MediaImportPolicy;
  private readonly providers: Partial<
    Record<MediaType, { adapter: IMediaProvider; name: string }>
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
      [MediaType.GAME]: { adapter: this.igdbAdapter, name: 'igdb' },
      [MediaType.MOVIE]: { adapter: this.tmdbAdapter, name: 'tmdb' },
      [MediaType.TV]: { adapter: this.tmdbAdapter, name: 'tmdb' },
      [MediaType.BOOK]: {
        adapter: this.googleBooksAdapter,
        name: 'google_books',
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
   * @throws {MediaAlreadyExistsError} Si le média est déjà présent en base.
   * @throws {MediaNotFoundInProviderError} Si l'ID externe est invalide.
   * @throws {ProviderUnavailableError} En cas d'échec technique de l'API externe.
   * @throws {UnsupportedMediaTypeError} Si le type de média n'est pas géré.
   * @returns {Promise<{ id: string, slug: string }>} L'UUID et le Slug du nouveau média créé.
   */
  async execute(
    command: ImportMediaCommand,
  ): Promise<{ id: string; slug: string }> {
    const { mediaId, type } = command;

    const providerConfig = this.providers[type];
    if (!providerConfig) {
      throw new UnsupportedMediaTypeError(type);
    }
    const { adapter, name: providerName } = providerConfig;

    logger.info(
      { type, mediaId, provider: providerName },
      '[ImportMediaHandler] Processing import',
    );

    // 1. Validation Domaine via Domain Service
    // Vérifie les doublons en utilisant les règles métier pures (ID externe)
    logger.debug('[ImportMediaHandler] Step 1: Domain Validation');
    await this.importPolicy.validateImport(providerName, mediaId);

    // 2. Orchestration Infrastructure (Récupération Données)
    // Appel au port (Interface) pour récupérer les données externes
    logger.debug('[ImportMediaHandler] Step 2: Fetching from Provider');

    let media;
    // Generate ID ahead of time
    const newId = this.mediaRepository.nextId();

    try {
      media = await adapter.getMedia(mediaId, type, newId);
    } catch (error) {
      // Re-throw exceptions du domaine telles quelles
      if (
        error instanceof UnsupportedMediaTypeError ||
        error instanceof InvalidProviderDataError
      ) {
        throw error;
      }
      // Encapsulation: On masque les erreurs techniques du provider derrière une erreur métier
      logger.error(
        { err: error, type, mediaId },
        '[ImportMediaHandler] Provider error',
      );
      throw new ProviderUnavailableError(
        providerName,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    // 3. Validation de l'existence
    if (!media) {
      logger.warn(
        { providerName, mediaId },
        '[ImportMediaHandler] Media not found in provider',
      );
      throw new MediaNotFoundInProviderError(providerName, mediaId);
    }

    // 4. Persistance
    // Délégation au Repository pour sauvegarder l'état
    logger.debug('[ImportMediaHandler] Step 3: Persisting to Repository');
    await this.mediaRepository.create(media);
    logger.info(
      { title: media.title, id: newId },
      '[ImportMediaHandler] Import successful',
    );

    return { id: newId, slug: media.slug };
  }
}
