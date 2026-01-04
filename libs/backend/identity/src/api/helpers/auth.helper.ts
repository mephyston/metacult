import { auth } from '../../infrastructure/auth/better-auth.service';
import { logger } from '@metacult/backend-infrastructure';
import { API_MESSAGES } from '@metacult/shared-core';

/**
 * Resolves the authenticated user from the context or throws a 401 error.
 * Includes a manual session recovery mechanism if the middleware failed to populate the user.
 *
 * @param ctx The Elysia context (must include request headers)
 * @returns The authenticated user object
 * @throws 401 Unauthorized if user cannot be resolved
 */
export async function resolveUserOrThrow(ctx: any) {
  const { user, error } = ctx;

  // 1. If user is already present (e.g. from middleware), return it
  if (user && user.id) {
    return user;
  }

  logger.warn(
    '[AuthHelper] User context missing - attempting manual session recovery',
  );

  // 2. Try manual recovery using Better Auth API
  try {
    const sessionData = await auth.api.getSession({
      headers: ctx.request.headers,
    });

    if (sessionData && sessionData.user) {
      logger.info(
        { userId: sessionData.user.id },
        '[AuthHelper] Recovery success',
      );
      // Optional: Patch context for subsequent handlers if needed (though we return the user mostly)
      ctx.user = sessionData.user;
      return sessionData.user;
    }
  } catch (e) {
    logger.error({ err: e }, '[AuthHelper] Unexpected error during recovery');
  }

  // 3. If all fails, throw 401
  logger.warn('[AuthHelper] Recovery failed - Unauthorized');
  // Utilize the error helper from the context if available, otherwise generic throw
  if (error) {
    throw error(401, {
      success: false,
      message: API_MESSAGES.AUTH.UNAUTHORIZED_SHORT,
    });
  }
  throw new Error(API_MESSAGES.AUTH.UNAUTHORIZED_SHORT);
}
