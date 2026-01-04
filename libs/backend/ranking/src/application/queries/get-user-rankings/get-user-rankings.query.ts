/**
 * Query pour récupérer le classement personnel d'un utilisateur.
 * Le classement est calculé en rejouant l'historique des interactions via l'algorithme ELO.
 */
export interface GetUserRankingsQuery {
  /**
   * ID de l'utilisateur dont on veut le classement.
   */
  userId: string;

  /**
   * Nombre maximum de médias à retourner dans le classement.
   * @default 10
   */
  limit?: number;
}
