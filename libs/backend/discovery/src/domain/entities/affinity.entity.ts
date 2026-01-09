export interface AffinityProps {
  userId: string;
  mediaId: string;
  score: number;
  lastUpdated: Date;
}

export class Affinity {
  public readonly userId: string;
  public readonly mediaId: string;
  public readonly score: number;
  public readonly lastUpdated: Date;

  constructor(props: AffinityProps) {
    this.userId = props.userId;
    this.mediaId = props.mediaId;
    this.score = props.score;
    this.lastUpdated = props.lastUpdated;
  }

  /**
   * Factory method to create a new Affinity instance (default score).
   */
  static create(
    userId: string,
    mediaId: string,
    initialScore = 1200,
  ): Affinity {
    return new Affinity({
      userId,
      mediaId,
      score: initialScore,
      lastUpdated: new Date(),
    });
  }

  /**
   * Updates the affinity score.
   */
  updateScore(newScore: number): Affinity {
    return new Affinity({
      userId: this.userId,
      mediaId: this.mediaId,
      score: newScore,
      lastUpdated: new Date(),
    });
  }
}
