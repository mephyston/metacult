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

export class ImportMediaHandler {
    private readonly importPolicy: MediaImportPolicy;

    constructor(
        private readonly mediaRepository: IMediaRepository,
        private readonly igdbAdapter: IMediaProvider,
        private readonly tmdbAdapter: IMediaProvider,
        private readonly googleBooksAdapter: IMediaProvider
    ) {
        this.importPolicy = new MediaImportPolicy(mediaRepository);
    }

    async execute(command: ImportMediaCommand): Promise<void> {
        const { mediaId, type } = command;

        console.log(`[ImportMediaHandler] Processing ${type} ID: ${mediaId}`);

        // 1. Validate import using Domain Service (throws MediaAlreadyExistsError if duplicate)
        const providerName = this.mapTypeToProviderName(type);
        await this.importPolicy.validateImport(providerName, mediaId);

        // 2. Fetch from appropriate provider
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
        } catch (error) {
            // Re-throw domain exceptions as-is
            if (error instanceof UnsupportedMediaTypeError) {
                throw error;
            }

            // Wrap provider errors in domain exceptions
            console.error(`[ImportMediaHandler] Provider error for ${type}/${mediaId}:`, error);
            throw new ProviderUnavailableError(
                providerName,
                error instanceof Error ? error : new Error(String(error))
            );
        }

        // 3. Validate media was found
        if (!media) {
            throw new MediaNotFoundInProviderError(providerName, mediaId);
        }

        // 4. Save to repository
        await this.mediaRepository.create(media);
        console.log(`[ImportMediaHandler] Successfully imported ${media.title}`);
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
