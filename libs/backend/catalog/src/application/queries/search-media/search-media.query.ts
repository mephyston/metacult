import { MediaType } from '../../../domain/entities/media.entity';

export class SearchMediaQuery {
    constructor(
        public readonly search?: string,
        public readonly type?: MediaType,
        public readonly tag?: string
    ) { }
}
