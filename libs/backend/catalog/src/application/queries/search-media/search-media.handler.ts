import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { SearchMediaQuery } from './search-media.query';
import type { Media } from '../../../domain/entities/media.entity';

export class SearchMediaHandler {
    constructor(
        private readonly mediaRepository: IMediaRepository
    ) { }

    async execute(query: SearchMediaQuery): Promise<Media[]> {
        console.log(`[SearchMediaHandler] Search: "${query.search || ''}" Type: ${query.type || 'ALL'}`);
        return this.mediaRepository.search({
            search: query.search,
            type: query.type,
            tag: query.tag
        });
    }
}
