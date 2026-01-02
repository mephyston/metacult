import Elysia, { type Context } from 'elysia';
import { auth } from '../../infrastructure/auth/better-auth.service';

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
export const isAuthenticated = new Elysia({ name: 'auth-guard' })
    .derive(async ({ headers, request }) => {
        const cookie = request.headers.get('cookie');
        console.log('[AuthGuard] Request URL:', request.url);
        console.log('[AuthGuard] Origin:', request.headers.get('origin'));
        console.log('[AuthGuard] Cookie length:', cookie ? cookie.length : 0);

        // Récupère la session depuis les headers (Cookie ou Authorization Bearer)
        const sessionData = await auth.api.getSession({
            headers: headers as HeadersInit
        });

        console.log('[AuthGuard] Session found:', !!sessionData?.user);

        // Injecte user et session dans le contexte (ou null si pas authentifié)
        return {
            user: sessionData?.user || null,
            session: sessionData?.session || null
        };
    })
    .onBeforeHandle(({ user, session, set }): void | { error: string; message: string } => {
        // Vérifie que l'utilisateur est bien authentifié
        if (!user || !session) {
            set.status = 401;
            return {
                error: 'Unauthorized',
                message: 'Valid authentication required'
            };
        }
    });

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
