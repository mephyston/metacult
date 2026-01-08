import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IInteractionRepository } from '../../application/ports/interaction.repository.interface';
import {
  UserInteraction,
  InteractionAction,
  InteractionSentiment,
} from '../../domain/entities/user-interaction.entity';
import {
  userInteractions,
  actionEnum,
  sentimentEnum,
  userFollows,
} from '../db/interactions.schema';

export class DrizzleInteractionRepository implements IInteractionRepository {
  constructor(private readonly db: NodePgDatabase<any>) {}

  async save(interaction: UserInteraction): Promise<void> {
    await this.db
      .insert(userInteractions)
      .values({
        id: interaction.id,
        userId: interaction.userId,
        mediaId: interaction.mediaId,
        action: interaction.action,
        sentiment: interaction.sentiment,
        createdAt: interaction.createdAt,
        updatedAt: interaction.updatedAt,
      })
      .onConflictDoUpdate({
        target: [userInteractions.userId, userInteractions.mediaId],
        set: {
          action: interaction.action,
          sentiment: interaction.sentiment,
          updatedAt: new Date(),
        },
      });
  }

  async findByUserAndMedia(
    userId: string,
    mediaId: string,
  ): Promise<UserInteraction | null> {
    const result = await this.db
      .select()
      .from(userInteractions)
      .where(
        and(
          eq(userInteractions.userId, userId),
          eq(userInteractions.mediaId, mediaId),
        ),
      )
      .limit(1);

    if (result.length === 0) return null;
    return this.mapToEntity(result[0]);
  }

  async findAllByUser(userId: string): Promise<UserInteraction[]> {
    const results = await this.db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));

    return results.map(this.mapToEntity);
  }

  async getSwipedMediaIds(userId: string): Promise<string[]> {
    const results = await this.db
      .select({ mediaId: userInteractions.mediaId })
      .from(userInteractions)
      .where(
        and(
          eq(userInteractions.userId, userId),
          // Exclude wishlist
          sql`${userInteractions.action} != 'WISHLIST'`,
        ),
      );

    return results.map((r) => r.mediaId);
  }

  async followUser(followerId: string, followingId: string): Promise<void> {
    await this.db
      .insert(userFollows)
      .values({
        followerId,
        followingId,
      })
      .onConflictDoNothing();
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await this.db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId),
        ),
      );
  }

  async getFollowers(userId: string): Promise<string[]> {
    const results = await this.db
      .select({ followerId: userFollows.followerId })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId));
    return results.map((r) => r.followerId);
  }

  async getFollowing(userId: string): Promise<string[]> {
    const results = await this.db
      .select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId));
    return results.map((r) => r.followingId);
  }

  async getFeed(
    userIds: string[],
    limit = 50,
    offset = 0,
  ): Promise<UserInteraction[]> {
    if (userIds.length === 0) return [];

    const results = await this.db
      .select()
      .from(userInteractions)
      .where(inArray(userInteractions.userId, userIds))
      .orderBy(desc(userInteractions.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map(this.mapToEntity);
  }

  private mapToEntity(raw: any): UserInteraction {
    return new UserInteraction(
      raw.id,
      raw.userId,
      raw.mediaId,
      raw.action as InteractionAction,
      raw.sentiment as InteractionSentiment | null,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}
