import { MediaType } from '../../../domain/entities/media.entity';

export class ImportMediaCommand {
    constructor(
        public readonly mediaId: string,
        public readonly type: MediaType
    ) { }
}
