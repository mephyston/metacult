import Elysia from 'elysia';
import { auth } from '../infrastructure/auth/better-auth.service';

/**
 * Routes publiques d'authentification (Better Auth).
 *
 * Expose toutes les routes Better Auth sous `/api/auth/*`:
 * - POST /api/auth/sign-up/email
 * - POST /api/auth/sign-in/email
 * - POST /api/auth/sign-out
 * - GET /api/auth/session
 * - etc.
 *
 * @see https://better-auth.com/docs/concepts/authentication
 */
export const createAuthRoutes = () => {
  return (
    new Elysia({ prefix: '/api/auth' })
      // CRITICAL: Skip Elysia's body parsing using onParse hook
      // When onParse sets Context.body, Elysia stops further parsing
      // This leaves the request stream intact for Better Auth to read
      .onParse(() => {
        // By returning without setting context.body, we skip parsing
        // for all routes in this Elysia instance
        return;
      })
      // Handler receives raw request without body consumption
      .all('/*', (ctx) => auth.handler(ctx.request))
      .as('global')
  );
};
