export class PersonalAffinityService {
  /**
   * Calculates the new Elo rating for a Global Media update.
   * Uses a lower K-factor (e.g., 20) for stability compared to personal affinity.
   */
  static calculateGlobalElo(
    winnerElo: number,
    loserElo: number,
    kFactor = 20,
  ): { winnerNewElo: number; loserNewElo: number } {
    const expectedScoreWinner =
      1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedScoreLoser =
      1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const winnerNewElo = Math.round(
      winnerElo + kFactor * (1 - expectedScoreWinner),
    );
    const loserNewElo = Math.round(
      loserElo + kFactor * (0 - expectedScoreLoser),
    );

    return { winnerNewElo, loserNewElo };
  }
  private static readonly K_FACTOR = 80;
  private static readonly BONUS = {
    BANGER: 400,
    GOOD: 200,
    OKAY: 0,
    DISLIKE: -Infinity, // Special handling
  };

  /**
   * Calculates the initial affinity score based on global Elo and user sentiment.
   * @param globalElo The global Elo rating of the media
   * @param sentiment The user's sentiment towards the media
   * @returns The initial affinity score
   */
  static initialize(
    globalElo: number,
    sentiment: 'BANGER' | 'GOOD' | 'OKAY' | 'DISLIKE',
  ): number {
    if (sentiment === 'DISLIKE') {
      return 800; // Forced low score
    }
    return globalElo + this.BONUS[sentiment];
  }

  /**
   * Updates scores after a duel between two items (or an item and a user affinity).
   * @param winnerScore Current score of the winner
   * @param loserScore Current score of the loser
   * @returns Object containing the new scores for winner and loser
   */
  static updateAfterDuel(
    winnerScore: number,
    loserScore: number,
  ): { winnerNewScore: number; loserNewScore: number } {
    const expectedWinner = 1 / (1 + 10 ** ((loserScore - winnerScore) / 400));
    const expectedLoser = 1 / (1 + 10 ** ((winnerScore - loserScore) / 400));

    const winnerNewScore = Math.round(
      winnerScore + this.K_FACTOR * (1 - expectedWinner),
    );
    const loserNewScore = Math.round(
      loserScore + this.K_FACTOR * (0 - expectedLoser),
    );

    return {
      winnerNewScore,
      loserNewScore,
    };
  }
}
