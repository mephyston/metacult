import type { UserId, MediaId } from '@metacult/shared-core';
import type { UserInteraction } from '../../domain/entities/user-interaction.entity';

export interface IInteractionRepository {
  save(interaction: UserInteraction): Promise<void>;
  findByUserAndMedia(
    userId: UserId,
    mediaId: MediaId,
  ): Promise<UserInteraction | null>;
  findAllByUser(userId: UserId): Promise<UserInteraction[]>;
  getSwipedMediaIds(userId: UserId): Promise<MediaId[]>;
  followUser(followerId: UserId, followingId: UserId): Promise<void>;
  unfollowUser(followerId: UserId, followingId: UserId): Promise<void>;
  getFollowers(userId: UserId): Promise<UserId[]>;
  getFollowing(userId: UserId): Promise<UserId[]>;
  getFeed(
    userIds: UserId[],
    limit?: number,
    offset?: number,
  ): Promise<UserInteraction[]>;
}
