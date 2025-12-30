import type { IMediaRepository } from '../../ports/media.repository.interface';
import type { SearchMediaQuery } from './search-media.query';
import type { MediaReadDto } from './media-read.dto';

/**
 * Handler pour la requête de recherche de médias (Query Handler).
 * Fait partie de l'approche CQRS (séparation Lecture/Écriture).
 * Utilise le Repository pour effectuer des lectures optimisées (Projection/DTO).
 */
export class SearchMediaHandler {
    constructor(
        private readonly mediaRepository: IMediaRepository
    ) { }

    /**
     * Exécute la logique de recherche.
     * @param {SearchMediaQuery} query - Critères de recherche.
     * @returns {Promise<MediaReadDto[]>} Liste de résultats (DTOs légers pour l'affichage).
     */
    async execute(query: SearchMediaQuery): Promise<MediaReadDto[]> {
        console.log(`[SearchMediaHandler] Recherche : "${query.search || ''}" Type : ${query.type || 'TOUS'}`);
        return this.mediaRepository.searchViews({
            search: query.search,
            type: query.type,
            tag: query.tag
        });
    }
}
