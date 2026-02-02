import type { UserId } from '@metacult/shared-core';

export interface SyncInteractionPayload {
  mediaId: string; // Payload from API usually is string
  action: string;
  sentiment?: string;
}

export interface IInteractionRepository {
  followUser(followerId: UserId, followingId: UserId): Promise<void>;
  unfollowUser(followerId: UserId, followingId: UserId): Promise<void>;
  syncInteractions(
    userId: UserId,
    interactions: SyncInteractionPayload[],
  ): Promise<void>;
}
