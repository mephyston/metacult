import { eq } from 'drizzle-orm';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { userStats } from '../../infrastructure/db/gamification.schema';
import { UserStats } from '../../domain/entities/user-stats.entity';

export class GamificationService {
  /**
   * Adds XP to a user and updates their level.
   */
  async addXp(userId: string, amount: number, source: string) {
    const { db } = getDbConnection();
    // 1. Get or create stats
    const existingStats = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .then((rows) => rows[0]);

    let rawStats = existingStats;

    if (!rawStats) {
      const [newStats] = await db
        .insert(userStats)
        .values({ userId })
        .returning();

      if (!newStats) {
        throw new Error('Failed to initialize user stats');
      }
      rawStats = newStats;
    }

    // 2. Hydrate Entity (Factory logic, could be in Mapper)
    const entity = new UserStats({
      id: rawStats.id,
      userId: rawStats.userId,
      xp: rawStats.xp,
      level: rawStats.level,
      currLevelXp: rawStats.currLevelXp,
      nextLevelXp: rawStats.nextLevelXp,
      createdAt: rawStats.createdAt,
      updatedAt: rawStats.updatedAt,
    });

    // 3. Domain Logic (Command)
    entity.addXp(amount);

    // 4. Update DB (Repository Logic)
    const snapshot = entity.toSnapshot();
    const [updated] = await db
      .update(userStats)
      .set({
        xp: snapshot.xp,
        level: snapshot.level,
        currLevelXp: snapshot.currLevelXp,
        nextLevelXp: snapshot.nextLevelXp,
        // updatedAt handled by DB default usually but good to be explicit if entity changes it
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
