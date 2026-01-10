import { Elysia, t } from 'elysia';
import {
  isAuthenticated,
  resolveUserOrThrow,
} from '@metacult/backend-identity';
import { logger } from '@metacult/backend-infrastructure';
import {
  followUserCommand,
  unfollowUserCommand,
} from '../../../application/commands/social-graph.command';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { DrizzleInteractionRepository } from '../../../infrastructure/repositories/drizzle-interaction.repository';
import * as schema from '../../../infrastructure/db/interactions.schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import type { FollowUserDto } from '../../../application/dtos/interaction.dto';
import { asUserId } from '@metacult/shared-core';

// const { db } = getDbConnection(); // Moved inside handlers
// const interactionRepo = new DrizzleInteractionRepository(db); // Moved inside handlers

export const socialController = new Elysia({ prefix: '/social' })
  .use(isAuthenticated)
  .post(
    '/follow',
    async (ctx) => {
      const { body, set } = ctx as unknown as { body: FollowUserDto; set: any };
      try {
        const user = await resolveUserOrThrow(ctx);
        const targetUserId = body.targetUserId;

        if (user.id === targetUserId) {
          set.status = 400;
          return { success: false, message: 'Cannot follow yourself' };
        }

        await followUserCommand(user.id, targetUserId);

        return {
          success: true,
          message: 'User followed',
        };
      } catch (e: any) {
        logger.error({ err: e }, '[SocialController] Error following user');
        set.status = 500;
        return {
          success: false,
          message: 'Failed to follow user',
          error: e.message,
        };
      }
    },
    {
      body: t.Object({
        targetUserId: t.String(),
      }),
      detail: {
        tags: ['Social'],
        summary: 'Follow User',
        description: 'Follow another user.',
      },
    },
  )
  .delete(
    '/follow',
    async (ctx) => {
      const { body, set } = ctx as unknown as { body: FollowUserDto; set: any };
      try {
        const user = await resolveUserOrThrow(ctx);
        const targetUserId = body.targetUserId;

        await unfollowUserCommand(user.id, targetUserId);

        return {
          success: true,
          message: 'User unfollowed',
        };
      } catch (e: any) {
        logger.error({ err: e }, '[SocialController] Error unfollowing user');
        set.status = 500;
        return {
          success: false,
          message: 'Failed to unfollow user',
          error: e.message,
        };
      }
    },
    {
      body: t.Object({
        targetUserId: t.String(),
      }),
      detail: {
        tags: ['Social'],
        summary: 'Unfollow User',
        description: 'Unfollow another user.',
      },
    },
  )
  .get(
    '/following',
    async (ctx) => {
      try {
        const user = await resolveUserOrThrow(ctx);
        const { db } = getDbConnection();
        const interactionRepo = new DrizzleInteractionRepository(
          db as unknown as NodePgDatabase<typeof schema>,
        );
        const following = await interactionRepo.getFollowing(asUserId(user.id));
        return {
          success: true,
          data: following,
        };
      } catch (e: any) {
        logger.error({ err: e }, '[SocialController] Error fetching following');
        ctx.set.status = 500;
        return {
          success: false,
          message: 'Failed to fetch following',
          error: e.message,
        };
      }
    },
    {
      detail: {
        tags: ['Social'],
        summary: 'Get Following',
        description: 'Get list of user IDs that I follow.',
      },
    },
  )
  .get(
    '/followers',
    async (ctx) => {
      try {
        const user = await resolveUserOrThrow(ctx);
        const { db } = getDbConnection();
        const interactionRepo = new DrizzleInteractionRepository(
          db as unknown as NodePgDatabase<typeof schema>,
        );
        const followers = await interactionRepo.getFollowers(asUserId(user.id));
        return {
          success: true,
          data: followers,
        };
      } catch (e: any) {
        logger.error({ err: e }, '[SocialController] Error fetching followers');
        ctx.set.status = 500;
        return {
          success: false,
          message: 'Failed to fetch followers',
          error: e.message,
        };
      }
    },
    {
      detail: {
        tags: ['Social'],
        summary: 'Get Followers',
        description: 'Get list of user IDs following me.',
      },
    },
  );
