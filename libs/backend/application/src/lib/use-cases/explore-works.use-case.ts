import { WorkType } from '@metacult/backend/domain';
import type { IWorkRepository, Work } from '@metacult/backend/domain';

export interface ExploreWorksInput {
    search?: string;
    type?: WorkType;
    tag?: string;
}

export class ExploreWorksUseCase {
    constructor(private readonly workRepository: IWorkRepository) { }

    async execute(input: ExploreWorksInput): Promise<Work[]> {
        // Business logic can be added here (logging, stats, complex filtering rules)

        // Example: Maybe we want to enforce that "search" must be at least 3 chars if provided
        if (input.search && input.search.length < 3) {
            // For now just ignore short search or return empty? Let's just pass it through 
            // but normally we would validate Input here.
        }

        return this.workRepository.search({
            search: input.search,
            type: input.type,
            tag: input.tag,
        });
    }
}
