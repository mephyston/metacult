import { MediaType } from '../../../domain/entities/media.entity';

/**
 * Commande (DTO) représentant une intention d'importer un média.
 * Transporte les données nécessaires du Worker vers le Handler.
 * 
 * @class ImportMediaCommand
 */
export class ImportMediaCommand {
    /**
     * @param {string} mediaId - Identifiant externe du média à importer.
     * @param {MediaType} type - Type de média.
     */
    constructor(
        public readonly mediaId: string,
        public readonly type: MediaType
    ) { }
}
