
/**
 * Service de domaine responsable du calcul des scores ELO.
 * Implémente la logique pure de mise à jour des classements.
 */
export class EloCalculator {
    private readonly K_FACTOR = 32;

    /**
     * Calcule les nouveaux scores ELO pour un gagnant et un perdant.
     * 
     * Formule : Rn = Ro + K * (W - We)
     * W = 1 pour le gagnant, 0 pour le perdant.
     * We = 1 / (1 + 10^((OpponentElo - MyElo) / 400))
     * 
     * @param winnerElo Score actuel du gagnant
     * @param loserElo Score actuel du perdant
     * @returns Les nouveaux scores arrondis à l'entier le plus proche
     */
    public calculateNewScores(winnerElo: number, loserElo: number): { winnerNewElo: number, loserNewElo: number } {
        const expectedScoreWinner = this.getExpectedScore(winnerElo, loserElo);
        const expectedScoreLoser = this.getExpectedScore(loserElo, winnerElo);

        // K * (Actual - Expected)
        // Actual -> Gagnant = 1, Perdant = 0
        const winnerNewElo = Math.round(winnerElo + this.K_FACTOR * (1 - expectedScoreWinner));
        const loserNewElo = Math.round(loserElo + this.K_FACTOR * (0 - expectedScoreLoser));

        return {
            winnerNewElo,
            loserNewElo
        };
    }

    /**
     * Calcule la probabilité de victoire (Expected Score).
     * @param playerElo Elo du joueur
     * @param opponentElo Elo de l'adversaire
     */
    private getExpectedScore(playerElo: number, opponentElo: number): number {
        return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
    }
}
