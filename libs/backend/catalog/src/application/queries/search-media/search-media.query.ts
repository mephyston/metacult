import { MediaType } from '../../../domain/entities/media.entity';

/**
 * Objet Query encapsulant les critères de recherche utilisateur.
 * Immuable.
 */
export class SearchMediaQuery {
    constructor(
        public readonly search?: string,
        public readonly type?: MediaType,
        public readonly tag?: string
    ) { }
}
