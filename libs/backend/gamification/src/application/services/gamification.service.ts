import type { IGamificationRepository } from '../../domain/ports/gamification.repository.interface';

export class GamificationService {
  constructor(private readonly repository: IGamificationRepository) {}

  /**
   * Adds XP to a user and updates their level.
   */
  async addXp(userId: string, amount: number, _source: string) {
    // 1. Get or create stats via Repo
    const entity = await this.repository.getUserStats(userId);

    // 2. Domain Logic
    entity.addXp(amount);

    // 3. Persist
    const updated = await this.repository.saveUserStats(entity);
    return updated;
  }

  async getUserStats(userId: string) {
    return this.repository.getUserStats(userId);
  }
}
