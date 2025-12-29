import type { IMediaProvider, IMediaRepository } from '@metacult/backend/domain';
import { MediaType } from '@metacult/backend/domain';

export interface ImportMediaCommand {
    type: MediaType;
    sourceId: string;
}

export class ImportMediaUseCase {
    constructor(
        private readonly repository: IMediaRepository,
        // In a real app, this might be a Strategy pattern or a Registry
        private readonly gameProvider: IMediaProvider,
        private readonly movieProvider: IMediaProvider,
        private readonly bookProvider: IMediaProvider
    ) { }

    async execute(command: ImportMediaCommand): Promise<void> {
        console.log(`🧠 [UseCase] Executing Import for ${command.type}:${command.sourceId}`);

        // 1. Select Strategy
        let provider: IMediaProvider;
        switch (command.type) {
            case MediaType.GAME:
                provider = this.gameProvider;
                break;
            case MediaType.MOVIE:
            case MediaType.TV:
                provider = this.movieProvider; // TMDB handles both
                break;
            case MediaType.BOOK:
                provider = this.bookProvider;
                break;
            default:
                throw new Error(`No provider configured for type ${command.type}`);
        }

        // 2. Fetch & Adapt (Pure Domain Entity returned)
        const mediaEntity = await provider.getMedia(command.sourceId, command.type);

        if (!mediaEntity) {
            console.warn(`⚠️ [UseCase] Provider returned no data for ${command.sourceId}`);
            return;
        }

        // 3. Persist
        await this.repository.create(mediaEntity);
        console.log(`✅ [UseCase] Successfully imported ${mediaEntity.title}`);
    }
}
