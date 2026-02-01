import type { IGamificationRepository } from '../../domain/ports/gamification.repository.interface';
import type { UserId } from '@metacult/shared-core';

export class GamificationService {
  constructor(private readonly repository: IGamificationRepository) {}

  /**
   * Adds XP to a user and updates their level.
   */
  async addXp(userId: UserId, amount: number): Promise<void> {
    // 1. Get or create stats via Repo
    const entity = await this.repository.getUserStats(userId);

    // 2. Domain Logic
    entity.addXp(amount);

    // 3. Persist
    const updated = await this.repository.saveUserStats(entity);
  }

  async getUserStats(userId: string) {
    return this.repository.getUserStats(userId);
  }
}
