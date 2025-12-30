import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { SearchMediaQuery } from './search-media.query';
import type { MediaReadDto } from './media-read.dto';

export class SearchMediaHandler {
    constructor(
        private readonly mediaRepository: IMediaRepository
    ) { }

    async execute(query: SearchMediaQuery): Promise<MediaReadDto[]> {
        console.log(`[SearchMediaHandler] Search: "${query.search || ''}" Type: ${query.type || 'ALL'}`);
        return this.mediaRepository.searchViews({
            search: query.search,
            type: query.type,
            tag: query.tag
        });
    }
}
