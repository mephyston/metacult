import type { IInteractionRepository } from '../../domain/ports/interaction.repository.interface';
import { asUserId } from '@metacult/shared-core';

export class SocialGraphHandler {
  constructor(private readonly interactionRepository: IInteractionRepository) {}

  async follow(followerId: string, followingId: string): Promise<void> {
    await this.interactionRepository.followUser(
      asUserId(followerId),
      asUserId(followingId),
    );
  }

  async unfollow(followerId: string, followingId: string): Promise<void> {
    await this.interactionRepository.unfollowUser(
      asUserId(followerId),
      asUserId(followingId),
    );
  }
}
