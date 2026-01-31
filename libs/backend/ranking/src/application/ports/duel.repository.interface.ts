import type { RankedMedia } from '../../domain/types/ranked-media.type';

/**
 * Port pour l'accès aux données des Duels.
 */
export interface DuelRepository {
  /**
   * Récupère une paire aléatoire de médias pour un duel, parmi les favoris de l'utilisateur.
   * @param userId ID de l'utilisateur connecté.
   * @returns Un tableau contenant exactement 2 médias.
   */
  getRandomPairForUser(userId: string): Promise<RankedMedia[]>;

  /**
   * Récupère un média par son ID.
   * @param id ID du média.
   */
  findById(id: string): Promise<RankedMedia | undefined>;

  /**
   * Met à jour les scores ELO de deux médias de manière atomique.
   * @param winnerId ID du gagnant.
   * @param winnerNewElo Nouveau score ELO du gagnant.
   * @param loserId ID du perdant.
   * @param loserNewElo Nouveau score ELO du perdant.
   */
  updateEloScores(
    winnerId: string,
    winnerNewElo: number,
    loserId: string,
    loserNewElo: number,
  ): Promise<void>;
}
