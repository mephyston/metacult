import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { IMediaProvider } from '../../ports/media-provider.interface';
import type { ImportMediaCommand } from './import-media.command';
import { MediaType } from '../../../domain/entities/media.entity';
import { MediaImportPolicy } from '../../../domain/services/media-import.policy';
import {
    MediaNotFoundInProviderError,
    ProviderUnavailableError,
    UnsupportedMediaTypeError
} from '../../../domain/errors/catalog.errors';

/**
 * Cas d'Utilisation (Use Case) : Importer un média externe.
 * Orchestre les interactions entre le Domaine, les Providers externes et le Repository.
 * 
 * @class ImportMediaHandler
 */
export class ImportMediaHandler {
    private readonly importPolicy: MediaImportPolicy;

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
        private readonly googleBooksAdapter: IMediaProvider
    ) {
        this.importPolicy = new MediaImportPolicy(mediaRepository);
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
     * @returns {Promise<void>}
     */
    async execute(command: ImportMediaCommand): Promise<void> {
        const { mediaId, type } = command;

        console.log(`[ImportMediaHandler] Traitement ${type} ID: ${mediaId}`);
        console.log(`[ImportMediaHandler] Provider Name resolved: ${this.mapTypeToProviderName(type)}`);

        // 1. Validation Domaine via Domain Service
        // Vérifie les doublons en utilisant les règles métier pures (ID externe)
        console.log('[ImportMediaHandler] Step 1: Domain Validation...');
        const providerName = this.mapTypeToProviderName(type);
        await this.importPolicy.validateImport(providerName, mediaId);

        // 2. Orchestration Infrastructure (Récupération Données)
        // Appel au port (Interface) pour récupérer les données externes
        console.log('[ImportMediaHandler] Step 2: Fetching from Provider...');
        let media;
        try {
            const newId = this.mediaRepository.nextId();
            switch (type) {
                case MediaType.GAME:
                    media = await this.igdbAdapter.getMedia(mediaId, type, newId);
                    break;
                case MediaType.MOVIE:
                case MediaType.TV:
                    media = await this.tmdbAdapter.getMedia(mediaId, type, newId);
                    break;
                case MediaType.BOOK:
                    media = await this.googleBooksAdapter.getMedia(mediaId, type, newId);
                    break;
                default:
                    throw new UnsupportedMediaTypeError(type);
            }
            console.log(`[ImportMediaHandler] Provider returned media: ${media ? 'YES' : 'NO'}`);
        } catch (error) {
            // Re-throw exceptions du domaine telles quelles
            if (error instanceof UnsupportedMediaTypeError) {
                throw error;
            }
            // Encapsulation: On masque les erreurs techniques du provider derrière une erreur métier
            console.error(`[ImportMediaHandler] Erreur Provider pour ${type}/${mediaId}:`, error);
            throw new ProviderUnavailableError(
                providerName,
                error instanceof Error ? error : new Error(String(error))
            );
        }

        // 3. Validation de l'existence
        if (!media) {
            console.warn(`[ImportMediaHandler] Media not found in provider.`);
            throw new MediaNotFoundInProviderError(providerName, mediaId);
        }

        // 4. Persistance
        // Délégation au Repository pour sauvegarder l'état
        console.log('[ImportMediaHandler] Step 3: Persisting to Repository...');
        await this.mediaRepository.create(media);
        console.log(`[ImportMediaHandler] Succès import de ${media.title}`);
    }

    private mapTypeToProviderName(type: MediaType): string {
        switch (type) {
            case MediaType.GAME: return 'igdb';
            case MediaType.MOVIE: return 'tmdb';
            case MediaType.TV: return 'tmdb';
            case MediaType.BOOK: return 'google_books';
            default: throw new UnsupportedMediaTypeError(type);
        }
    }
}
