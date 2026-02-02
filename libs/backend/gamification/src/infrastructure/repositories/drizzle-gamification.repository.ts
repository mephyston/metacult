import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UserStats } from '../../domain/entities/user-stats.entity';
import type { IGamificationRepository } from '../../domain/ports/gamification.repository.interface';
import { userStats } from '../db/gamification.schema';
import * as schema from '../db/gamification.schema';

export class DrizzleGamificationRepository implements IGamificationRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async getUserStats(userId: string): Promise<UserStats> {
    let rawStats = await this.db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .then((rows) => rows[0]);

    if (!rawStats) {
      const [newStats] = await this.db
        .insert(userStats)
        .values({ userId })
        .returning();

      if (!newStats) throw new Error('Failed to initialize user stats');
      rawStats = newStats;
    }

    return new UserStats({
      id: rawStats.id,
      userId: rawStats.userId,
      xp: rawStats.xp,
      level: rawStats.level,
      currLevelXp: rawStats.currLevelXp,
      nextLevelXp: rawStats.nextLevelXp,
      createdAt: rawStats.createdAt,
      updatedAt: rawStats.updatedAt,
    });
  }

  async saveUserStats(stats: UserStats): Promise<UserStats> {
    const snapshot = stats.toSnapshot();
    const [updated] = await this.db
      .update(userStats)
      .set({
        xp: snapshot.xp,
        level: snapshot.level,
        currLevelXp: snapshot.currLevelXp,
        nextLevelXp: snapshot.nextLevelXp,
        updatedAt: new Date(),
      })
      .where(eq(userStats.userId, snapshot.userId))
      .returning();

    if (!updated) throw new Error('Failed to save stats');

    // Return re-hydrated entity or just the input extended?
    // We restart from updated row to be sure
    return new UserStats({
      id: updated.id,
      userId: updated.userId,
      xp: updated.xp,
      level: updated.level,
      currLevelXp: updated.currLevelXp,
      nextLevelXp: updated.nextLevelXp,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  }
}
