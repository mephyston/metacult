import { eq, sql } from 'drizzle-orm';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { userStats } from '../infrastructure/db/gamification.schema';

export class GamificationService {
  /**
   * Calculates level based on XP.
   * Simple formula: Level = floor(sqrt(XP / 100)) + 1
   * Inverse: XP = 100 * (Level - 1)^2
   */
  private calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  private calculateXpForLevel(level: number): number {
    return 100 * Math.pow(level - 1, 2);
  }

  /**
   * Adds XP to a user and updates their level.
   */
  async addXp(userId: string, amount: number, source: string) {
    const { db } = getDbConnection();
    // 1. Get or create stats
    let [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));

    if (!stats) {
      const [newStats] = await db
        .insert(userStats)
        .values({ userId })
        .returning();
      stats = newStats;
    }

    // 2. Calculate new state
    const newXp = stats!.xp + amount;
    const newLevel = this.calculateLevel(newXp);

    // XP needed for current level start
    const currentLevelStartXp = this.calculateXpForLevel(newLevel);
    // XP needed for next level start
    const nextLevelStartXp = this.calculateXpForLevel(newLevel + 1);

    // Progress in current level
    const currLevelXp = newXp - currentLevelStartXp;
    const levelRange = nextLevelStartXp - currentLevelStartXp;

    // 3. Update DB
    const [updated] = await db
      .update(userStats)
      .set({
        xp: newXp,
        level: newLevel,
        currLevelXp: currLevelXp,
        nextLevelXp: levelRange, // Store range to make frontend math easier: progress = currLevelXp / nextLevelXp
      })
      .where(eq(userStats.userId, userId))
      .returning();

    return updated;
  }

  async getUserStats(userId: string) {
    const { db } = getDbConnection();
    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId));

    if (!stats) {
      // Initialize if empty
      const [newStats] = await db
        .insert(userStats)
        .values({ userId })
        .returning();
      return newStats;
    }

    return stats;
  }
}
