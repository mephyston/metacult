import { Affinity } from '../entities/affinity.entity';

export interface AffinityRepository {
  /**
   * Saves or updates an affinity record.
   * @param affinity The affinity entity to save.
   */
  save(affinity: Affinity): Promise<void>;

  /**
   * Finds an affinity record by user ID and media ID.
   * @param userId The ID of the user.
   * @param mediaId The ID of the media.
   * @returns The affinity entity if found, null otherwise.
   */
  findByUserAndMedia(userId: string, mediaId: string): Promise<Affinity | null>;

  /**
   * Finds all affinities for a user.
   * @param userId The ID of the user.
   * @returns Array of affinity entities.
   */
  findByUser(userId: string): Promise<Affinity[]>;
}
