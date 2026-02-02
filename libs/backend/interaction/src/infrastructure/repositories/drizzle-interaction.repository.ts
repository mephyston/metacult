import { eq, and, sql, inArray, desc } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type {
  IInteractionRepository,
  SyncInteractionPayload,
} from '../../domain/ports/interaction.repository.interface';
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

  async syncInteractions(
    userId: UserId,
    interactions: SyncInteractionPayload[],
  ): Promise<void> {
    for (const interaction of interactions) {
      try {
        if (interaction.action === 'SKIP') {
          const existing = await this.db
            .select()
            .from(userInteractions)
            .where(
              and(
                eq(userInteractions.userId, userId),
                eq(userInteractions.mediaId, interaction.mediaId),
              ),
            )
            .limit(1);

          if (existing.length > 0) {
            continue;
          }
        }

        await this.db
          .insert(userInteractions)
          .values({
            userId: userId,
            mediaId: asMediaId(interaction.mediaId),
            action: interaction.action as InteractionAction,
            sentiment: interaction.sentiment as InteractionSentiment | null,
          })
          .onConflictDoUpdate({
            target: [userInteractions.userId, userInteractions.mediaId],
            set: {
              action: interaction.action as InteractionAction,
              sentiment: interaction.sentiment as InteractionSentiment | null,
              updatedAt: new Date(),
            },
          });
      } catch (err: unknown) {
        const error = err as Error & { code?: string };
        if (error?.code !== '23503') {
          // Log error if not foreign key violation
          console.error('[Sync] Error syncing interaction', err);
        }
      }
    }
  }
}
