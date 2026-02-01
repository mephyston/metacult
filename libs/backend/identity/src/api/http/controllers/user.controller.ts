import { Elysia, t } from 'elysia';
import { getDbConnection, logger } from '@metacult/backend-infrastructure';
import { user as userModel } from '../../../infrastructure/db/auth.schema';
import { eq } from 'drizzle-orm';
import type { UserPublicProfileDto } from '../../../application/dtos/user.dto';
import { isAuthenticated } from '../../middleware/auth.middleware';

console.log('[DEBUG-MODULE] Loading user.controller.ts');
console.log('[DEBUG-MODULE] isAuthenticated type:', typeof isAuthenticated);
console.log(
  '[DEBUG-MODULE] isAuthenticated constructor:',
  isAuthenticated?.constructor?.name,
);

// const { db } = getDbConnection(); // Moved inside handlers
export const userController = new Elysia({ prefix: '/users' })
  .use(isAuthenticated)
  .onBeforeHandle(({ user, set }) => {
    // Redundant safety check, though middleware should handle this.
    // Keeping it minimal or rely fully on middleware.
    // Middleware returns 401 if !user.
    // However, TypeScript might need reassurance if types aren't propagated.
    if (!user) {
      set.status = 401;
      return { success: false, message: 'Unauthorized' };
    }
    return;
  })
  .get(
    '/:id',
    async ({ params, set }) => {
      try {
        const userId = params.id;
        const { db } = getDbConnection();
        const result = await db
          .select({
            id: userModel.id,
            name: userModel.name,
            image: userModel.image,
          })
          .from(userModel)
          .where(eq(userModel.id, userId))
          .limit(1);

        if (result.length === 0) {
          set.status = 404;
          return { success: false, message: 'User not found' };
        }

        const profile: UserPublicProfileDto = result[0]!;

        return {
          success: true,
          data: profile,
        };
      } catch (e: unknown) {
        const err = e as Error;
        logger.error({ err }, '[UserController] Error fetching user');
        set.status = 500;
        return {
          success: false,
          message: 'Failed to fetch user',
          error: err.message,
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
  )
  .patch(
    '/:id',
    async (context) => {
      const { params, body, set } = context;
      // Use proper type assertion or middleware inference
      const user = (context as unknown as { user: { id: string } }).user;

      try {
        const userId = params.id;

        // Security check: Only allow users to update their own profile
        if (user.id !== userId) {
          set.status = 403;
          return {
            success: false,
            message: 'Forbidden: You can only update your own profile',
          };
        }

        const { db } = getDbConnection();
        const updateData: Partial<typeof userModel.$inferSelect> = {};

        if (body.onboardingCompleted !== undefined) {
          updateData.onboardingCompleted = body.onboardingCompleted;
        }
        if (body.preferences !== undefined) {
          updateData.preferences = body.preferences;
        }

        const result = await db
          .update(userModel)
          .set(updateData)
          .where(eq(userModel.id, userId))
          .returning();

        if (result.length === 0) {
          set.status = 404;
          return { success: false, message: 'User not found' };
        }

        return {
          success: true,
          data: result[0],
        };
      } catch (e: unknown) {
        const err = e as Error;
        logger.error({ err }, '[UserController] Error updating user');
        set.status = 500;
        return {
          success: false,
          message: 'Failed to update user',
          error: err.message,
        };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        onboardingCompleted: t.Optional(t.Boolean()),
        preferences: t.Optional(
          t.Object({
            categories: t.Optional(t.Array(t.String())),
            genres: t.Optional(t.Array(t.String())),
          }),
        ),
      }),
      detail: {
        tags: ['User'],
        summary: 'Update User Profile',
        description:
          'Update user profile details (onboarding status, preferences). Restricted to the owner.',
      },
    },
  );
