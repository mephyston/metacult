import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { IMediaProvider } from '../../ports/media-provider.interface';
import type { ImportMediaCommand } from './import-media.command';
import { MediaType } from '../../../domain/entities/media.entity';

export class ImportMediaHandler {
    constructor(
        private readonly mediaRepository: IMediaRepository,
        private readonly igdbAdapter: IMediaProvider,
        private readonly tmdbAdapter: IMediaProvider,
        private readonly googleBooksAdapter: IMediaProvider
    ) { }

    async execute(command: ImportMediaCommand): Promise<void> {
        const { mediaId, type } = command;

        console.log(`[ImportMediaHandler] Processing ${type} ID: ${mediaId}`);

        // 1. Check if already exists
        const existing = await this.mediaRepository.findById(mediaId);
        if (existing) {
            console.log(`[ImportMediaHandler] Media ${mediaId} already exists. Skipping.`);
            return;
        }

        // 2. Fetch from strict provider
        let media = null;
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
                    throw new Error(`Unsupported media type: ${type}`);
            }
        } catch (error) {
            console.error(`[ImportMediaHandler] Provider error for ${type}/${mediaId}:`, error);
            throw error;
        }

        if (!media) {
            throw new Error(`Media not found in provider: ${type}/${mediaId}`);
        }

        // 3. Save to DB
        await this.mediaRepository.create(media);
        console.log(`[ImportMediaHandler] Successfully imported ${media.title}`);
    }
}
