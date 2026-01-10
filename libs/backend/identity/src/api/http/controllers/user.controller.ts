import { Elysia, t } from 'elysia';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';
import { user } from '../../../infrastructure/db/auth.schema';
import { eq } from 'drizzle-orm';

// const { db } = getDbConnection(); // Moved inside handlers
export const userController = new Elysia({ prefix: '/users' }).get(
  '/:id',
  async ({ params, set }) => {
    try {
      const userId = params.id;
      const { db } = getDbConnection();
      const result = await db
        .select({
          id: user.id,
          name: user.name,
          image: user.image,
        })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      if (result.length === 0) {
        set.status = 404;
        return { success: false, message: 'User not found' };
      }

      return {
        success: true,
        data: result[0],
      };
    } catch (e: any) {
      logger.error({ err: e }, '[UserController] Error fetching user');
      set.status = 500;
      return {
        success: false,
        message: 'Failed to fetch user',
        error: e.message,
      };
    }
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      tags: ['User'],
      summary: 'Get Public User Profile',
      description: 'Get public details of a user by ID.',
    },
  },
);
