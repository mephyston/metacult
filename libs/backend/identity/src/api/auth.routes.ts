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
      // CRITICAL: Pass handler function directly without destructuring context
      // Destructuring ({ request }) triggers Elysia's body parsing which causes
      // "Body already used" error when Better Auth tries to read the body
      .all('/*', (ctx) => auth.handler(ctx.request))
      .as('global')
  );
};
