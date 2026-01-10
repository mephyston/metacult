import { Neighbor } from '../entities/neighbor.entity';

export interface SimilarityRepository {
  /**
   * Saves or updates a neighbor similarity record.
   * @param neighbor The neighbor entity to save.
   */
  save(neighbor: Neighbor): Promise<void>;

  /**
   * Retrieves the neighbors (similar users) for a given user.
   * @param userId The ID of the user.
   * @returns A list of neighbor entities.
   */
  getNeighbors(userId: string): Promise<Neighbor[]>;
}
