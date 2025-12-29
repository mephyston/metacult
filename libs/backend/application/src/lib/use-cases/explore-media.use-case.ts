import { MediaType } from '@metacult/backend/domain';
import type { IMediaRepository, Media } from '@metacult/backend/domain';

export interface ExploreMediaInput {
    search?: string;
    type?: MediaType;
    tag?: string;
}

export interface ExploreMediaInput {
    search?: string;
    type?: MediaType;
    tag?: string;
}

export class ExploreMediaUseCase {
    constructor(private readonly mediaRepository: IMediaRepository) { }

    async execute(input: ExploreMediaInput): Promise<Media[]> {
        // Business logic can be added here (logging, stats, complex filtering rules)

        // Example: Maybe we want to enforce that "search" must be at least 3 chars if provided
        if (input.search && input.search.length < 3) {
            // For now just ignore short search or return empty? Let's just pass it through 
            // but normally we would validate Input here.
        }

        return this.mediaRepository.search({
            search: input.search,
            type: input.type,
            tag: input.tag,
        });
    }
}
