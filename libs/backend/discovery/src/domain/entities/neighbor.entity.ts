export interface NeighborProps {
  userId: string;
  neighborId: string;
  similarityScore: number;
  lastUpdated: Date;
}

export class Neighbor {
  public readonly userId: string;
  public readonly neighborId: string;
  public readonly similarityScore: number;
  public readonly lastUpdated: Date;

  constructor(props: NeighborProps) {
    this.userId = props.userId;
    this.neighborId = props.neighborId;
    this.similarityScore = props.similarityScore;
    this.lastUpdated = props.lastUpdated;
  }

  /**
   * Factory method to create a new Neighbor.
   */
  static create(
    userId: string,
    neighborId: string,
    similarityScore: number,
  ): Neighbor {
    return new Neighbor({
      userId,
      neighborId,
      similarityScore,
      lastUpdated: new Date(),
    });
  }
}
