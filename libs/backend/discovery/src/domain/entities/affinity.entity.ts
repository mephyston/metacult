export class Affinity {
  constructor(
    public readonly userId: string,
    public readonly mediaId: string,
    public readonly score: number,
    public readonly lastUpdated: Date,
  ) {}

  /**
   * Factory method to create a new Affinity instance (default score).
   */
  static create(
    userId: string,
    mediaId: string,
    initialScore = 1200,
  ): Affinity {
    return new Affinity(userId, mediaId, initialScore, new Date());
  }

  /**
   * Updates the affinity score.
   */
  updateScore(newScore: number): Affinity {
    return new Affinity(this.userId, this.mediaId, newScore, new Date());
  }
}
