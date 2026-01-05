export class Neighbor {
  constructor(
    public readonly userId: string,
    public readonly neighborId: string,
    public readonly similarityScore: number,
    public readonly lastUpdated: Date,
  ) {}

  /**
   * Factory method to create a new Neighbor.
   */
  static create(
    userId: string,
    neighborId: string,
    similarityScore: number,
  ): Neighbor {
    return new Neighbor(userId, neighborId, similarityScore, new Date());
  }
}
