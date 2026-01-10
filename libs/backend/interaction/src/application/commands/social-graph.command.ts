import { getDbConnection } from '@metacult/backend-infrastructure';
import { DrizzleInteractionRepository } from '../../infrastructure/repositories/drizzle-interaction.repository';
import * as schema from '../../infrastructure/db/interactions.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';

// const { db } = getDbConnection(); // Moved inside instructions
// const interactionRepo = new DrizzleInteractionRepository(db); // Removed global instantiation

export const followUserCommand = async (
  followerId: string,
  followingId: string,
) => {
  const { db } = getDbConnection();
  const interactionRepo = new DrizzleInteractionRepository(
    db as unknown as NodePgDatabase<typeof schema>,
  );
  await interactionRepo.followUser(followerId, followingId);
};

export const unfollowUserCommand = async (
  followerId: string,
  followingId: string,
) => {
  const { db } = getDbConnection();
  const interactionRepo = new DrizzleInteractionRepository(
    db as unknown as NodePgDatabase<typeof schema>,
  );
  await interactionRepo.unfollowUser(followerId, followingId);
};
