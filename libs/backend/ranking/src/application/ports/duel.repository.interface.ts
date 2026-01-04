import { Media } from '@metacult/backend-catalog';

/**
 * Port pour l'accès aux données des Duels.
 */
export interface DuelRepository {
    /**
     * Récupère une paire aléatoire de médias pour un duel, parmi les favoris de l'utilisateur.
     * @param userId ID de l'utilisateur connecté.
     * @returns Un tableau contenant exactement 2 médias.
     */
    getRandomPairForUser(userId: string): Promise<Media[]>;
}
