import Elysia, { type Context } from 'elysia';
import { auth, initAuth } from '../../infrastructure/auth/better-auth.service';
import { logger } from '@metacult/backend-infrastructure';
import { API_MESSAGES } from '@metacult/shared-core';

/**
 * Contexte enrichi après authentification réussie.
 */
export interface AuthenticatedContext {
  user: {
    id: string;
    email: string;
    name: string;
    emailVerified: boolean;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
}

/**
 * Plugin Elysia pour vérifier l'authentification.
 *
 * **Usage :**
 * ```ts
 * app.use(isAuthenticated)
 *    .get('/protected', ({ user, session }) => {
 *      return { message: `Hello ${user.name}` }
 *    })
 * ```
 *
 * **Fonctionnement :**
 * - Extrait le token depuis les headers (Cookie ou Authorization)
 * - Vérifie la session via Better Auth
 * - Si valide : injecte `user` et `session` dans le contexte
 * - Si invalide : retourne 401 Unauthorized
 *
 * @see https://better-auth.com/docs/concepts/sessions
 */
// @ts-expect-error Elysia scoped property type definition mismatch
export const isAuthenticated = new Elysia({ scoped: true })
  .derive(async ({ headers, request }) => {
    const cookie = request.headers.get('cookie');
    logger.debug(
      {
        url: request.url,
        origin: request.headers.get('origin'),
        cookieLength: cookie ? cookie.length : 0,
      },
      '[AuthGuard] Request',
    );

    // Récupère la session depuis les headers (Cookie ou Authorization Bearer)
    // Ensure auth is initialized before use
    const betterAuth = auth || initAuth();
    const sessionData = await betterAuth.api.getSession({
      headers: headers as HeadersInit,
    });

    logger.debug(
      { hasSession: !!sessionData?.user },
      '[AuthGuard] Session check',
    );

    // Injecte user et session dans le contexte (ou null si pas authentifié)
    return {
      user: sessionData?.user || null,
      session: sessionData?.session || null,
    };
  })
  .onBeforeHandle(
    ({ user, session, set }): void | { error: string; message: string } => {
      // Vérifie que l'utilisateur est bien authentifié
      if (!user || !session) {
        set.status = 401;
        return {
          error: API_MESSAGES.AUTH.UNAUTHORIZED_SHORT,
          message: API_MESSAGES.AUTH.AUTH_REQUIRED,
        };
      }
    },
  );

/**
 * Type helper pour les routes protégées.
 *
 * **Usage dans les routes :**
 * ```ts
 * import type { ProtectedRoute } from '@metacult/backend-identity';
 *
 * export const getProfile = (ctx: ProtectedRoute) => {
 *   return { email: ctx.user.email };
 * }
 * ```
 */
export type ProtectedRoute = Context & AuthenticatedContext;
/**
 * Plugin Elysia pour authentification OPTIONNELLE.
 * Injecte user/session dans le contexte si authentifié, sinon null.
 * Ne bloque PAS la requête si pas d'authentification.
 *
 * **Usage :**
 * ```ts
 * app.use(maybeAuthenticated)
 *    .get('/feed', ({ user }) => {
 *      if (user) {
 *        return { message: `Hello ${user.name}` }
 *      }
 *      return { message: 'Hello Guest' }
 *    })
 * ```
 */
export const maybeAuthenticated = new Elysia({
  // @ts-expect-error Elysia scoped property type definition mismatch
  scoped: true,
}).derive(async ({ headers, request }) => {
  const cookie = request.headers.get('cookie');
  logger.debug(
    {
      url: request.url,
      cookieLength: cookie ? cookie.length : 0,
      cookiePreview: cookie ? cookie.substring(0, 100) : 'none',
    },
    '[OptionalAuthGuard] Middleware executing',
  );

  // Récupère la session depuis les headers (Cookie ou Authorization Bearer)
  const betterAuth = auth || initAuth();
  const sessionData = await betterAuth.api.getSession({
    headers: headers as HeadersInit,
  });

  logger.debug(
    {
      hasSession: !!sessionData?.user,
      userId: sessionData?.user?.id || 'none',
    },
    '[OptionalAuthGuard] Session check',
  );

  // Injecte user et session dans le contexte (ou null si pas authentifié)
  return {
    user: sessionData?.user || null,
    session: sessionData?.session || null,
  };
});
// PAS de onBeforeHandle qui bloque !
