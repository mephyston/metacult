/**
 * Requête (Query) pour récupérer un fil d'actualité mixte (Contenu + Publicités).
 * Utilisé dans une architecture CQRS pour les lectures.
 *
 * @class GetMixedFeedQuery
 */
export class GetMixedFeedQuery {
  /**
   * @param {string} search - Terme de recherche ou contexte pour générer le flux.
   * @param {string} [userId] - Identifiant de l'utilisateur pour personnaliser le flux.
   * @param {string[]} [excludedMediaIds] - Liste d'IDs de médias à exclure (déjà vus).
   * @param {string[]} [types] - Types de médias à inclure (movie, tv, game, book).
   * @param {number} [limit=10] - Nombre maximum d'éléments à retourner.
   * @param {boolean} [isOnboarding=false] - Indique si le flux est pour l'onboarding.
   */
  constructor(
    public readonly search: string,
    public readonly userId?: string,
    public readonly excludedMediaIds?: string[],
    public readonly types?: string[],
    public readonly limit = 10,
    public readonly isOnboarding = false,
  ) {}
}
