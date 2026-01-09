import { getDbConnection } from '@metacult/backend-infrastructure';
import { DrizzleInteractionRepository } from '../../infrastructure/repositories/drizzle-interaction.repository';
import { userFollows } from '../../infrastructure/db/interactions.schema';
import { eq, and } from 'drizzle-orm';

// const { db } = getDbConnection(); // Moved inside instructions
// const interactionRepo = new DrizzleInteractionRepository(db); // Removed global instantiation

export const followUserCommand = async (
  followerId: string,
  followingId: string,
) => {
  const { db } = getDbConnection();
  const interactionRepo = new DrizzleInteractionRepository(db);
  await interactionRepo.followUser(followerId, followingId);
};

export const unfollowUserCommand = async (
  followerId: string,
  followingId: string,
) => {
  const { db } = getDbConnection();
  const interactionRepo = new DrizzleInteractionRepository(db);
  await interactionRepo.unfollowUser(followerId, followingId);
};
