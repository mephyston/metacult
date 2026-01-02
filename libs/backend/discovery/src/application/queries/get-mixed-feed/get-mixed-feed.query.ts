/**
 * Requête (Query) pour récupérer un fil d'actualité mixte (Contenu + Publicités).
 * Utilisé dans une architecture CQRS pour les lectures.
 * 
 * @class GetMixedFeedQuery
 */
export class GetMixedFeedQuery {
    /**
     * @param {string} search - Terme de recherche ou contexte pour générer le flux.
     */
    constructor(
        public readonly search: string,
        public readonly userId?: string,
        public readonly excludedMediaIds?: string[],
        public readonly limit: number = 10
    ) { }
}
