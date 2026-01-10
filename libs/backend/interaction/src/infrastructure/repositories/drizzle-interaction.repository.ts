import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { IInteractionRepository } from '../../application/ports/interaction.repository.interface';
import {
  UserInteraction,
  InteractionAction,
  InteractionSentiment,
} from '../../domain/entities/user-interaction.entity';
import { userInteractions, userFollows } from '../db/interactions.schema';
import * as schema from '../db/interactions.schema';
import {
  type UserId,
  asUserId,
  type MediaId,
  asMediaId,
  asInteractionId,
  asFollowId,
} from '@metacult/shared-core';

export class DrizzleInteractionRepository implements IInteractionRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  // ... (save method remains unchanged) ...

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

  // ... (other methods) ...

  async findByUserAndMedia(
    userId: UserId,
    mediaId: MediaId,
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

    const row = result[0];
    if (!row) return null;
    return this.mapToEntity(row);
  }

  async findAllByUser(userId: UserId): Promise<UserInteraction[]> {
    const results = await this.db
      .select()
      .from(userInteractions)
      .where(eq(userInteractions.userId, userId));

    return results.map((row) => this.mapToEntity(row));
  }

  async getSwipedMediaIds(userId: UserId): Promise<MediaId[]> {
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

    return results.map((r) => asMediaId(r.mediaId));
  }

  async followUser(followerId: UserId, followingId: UserId): Promise<void> {
    await this.db
      .insert(userFollows)
      .values({
        followerId,
        followingId,
      })
      .onConflictDoNothing();
  }

  async unfollowUser(followerId: UserId, followingId: UserId): Promise<void> {
    await this.db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId),
        ),
      );
  }

  async getFollowers(userId: UserId): Promise<UserId[]> {
    const results = await this.db
      .select({ followerId: userFollows.followerId })
      .from(userFollows)
      .where(eq(userFollows.followingId, userId));
    return results.map((r) => asUserId(r.followerId));
  }

  async getFollowing(userId: UserId): Promise<UserId[]> {
    const results = await this.db
      .select({ followingId: userFollows.followingId })
      .from(userFollows)
      .where(eq(userFollows.followerId, userId));
    return results.map((r) => asUserId(r.followingId));
  }

  async getFeed(
    userIds: UserId[],
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

    return results.map((row) => this.mapToEntity(row));
  }

  private mapToEntity(
    raw: typeof userInteractions.$inferSelect,
  ): UserInteraction {
    return new UserInteraction({
      id: asInteractionId(raw.id),
      userId: asUserId(raw.userId),
      mediaId: asMediaId(raw.mediaId),
      action: raw.action as InteractionAction,
      sentiment: raw.sentiment as InteractionSentiment | null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
