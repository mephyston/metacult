import type {
  UserInteraction,
  InteractionAction,
  InteractionSentiment,
} from '../../domain/entities/user-interaction.entity';

export interface IInteractionRepository {
  save(interaction: UserInteraction): Promise<void>;
  findByUserAndMedia(
    userId: string,
    mediaId: string,
  ): Promise<UserInteraction | null>;
  findAllByUser(userId: string): Promise<UserInteraction[]>;
  getSwipedMediaIds(userId: string): Promise<string[]>;
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<string[]>;
  getFollowing(userId: string): Promise<string[]>;
  getFeed(
    userIds: string[],
    limit?: number,
    offset?: number,
  ): Promise<UserInteraction[]>;
}
