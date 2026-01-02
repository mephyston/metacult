import { auth } from '../../infrastructure/auth/better-auth.service';

/**
 * Resolves the authenticated user from the context or throws a 401 error.
 * Includes a manual session recovery mechanism if the middleware failed to populate the user.
 * 
 * @param ctx The Elysia context (must include request headers)
 * @returns The authenticated user object
 * @throws 401 Unauthorized if user cannot be resolved
 */
export async function resolveUserOrThrow(ctx: any) {
    let { user, error } = ctx;

    // 1. If user is already present (e.g. from middleware), return it
    if (user && user.id) {
        return user;
    }

    console.warn('[AuthHelper] User context missing. Attempting manual session recovery...');

    // 2. Try manual recovery using Better Auth API
    try {
        const sessionData = await auth.api.getSession({
            headers: ctx.request.headers
        });

        if (sessionData && sessionData.user) {
            console.log('[AuthHelper] RECOVERY SUCCESS! User found:', sessionData.user.id);
            // Optional: Patch context for subsequent handlers if needed (though we return the user mostly)
            ctx.user = sessionData.user;
            return sessionData.user;
        }
    } catch (e) {
        console.error('[AuthHelper] unexpected error during recovery', e);
    }

    // 3. If all fails, throw 401
    console.warn('[AuthHelper] Recovery failed. Unauthorized.');
    // Utilize the error helper from the context if available, otherwise generic throw
    if (error) {
        throw error(401, { success: false, message: 'Unauthorized' });
    }
    throw new Error('Unauthorized');
}
