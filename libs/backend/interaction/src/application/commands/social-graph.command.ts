import { getDbConnection } from '@metacult/backend-infrastructure';
import { DrizzleInteractionRepository } from '../../infrastructure/repositories/drizzle-interaction.repository';

const { db } = getDbConnection();
const interactionRepo = new DrizzleInteractionRepository(db);

export async function followUserCommand(
  followerId: string,
  followingId: string,
): Promise<void> {
  await interactionRepo.followUser(followerId, followingId);
}

export async function unfollowUserCommand(
  followerId: string,
  followingId: string,
): Promise<void> {
  await interactionRepo.unfollowUser(followerId, followingId);
}
