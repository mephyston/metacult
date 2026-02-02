import type { UserStats } from '../entities/user-stats.entity';

export interface IGamificationRepository {
  getUserStats(userId: string): Promise<UserStats>;
  saveUserStats(stats: UserStats): Promise<UserStats>;
}
