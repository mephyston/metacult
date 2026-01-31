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
 * @see https://better-auth.com/docs/integrations/elysia
 */
export const createAuthRoutes = () => {
  return (
    new Elysia()
      // CRITICAL: Use .mount() instead of .use() or route handlers
      // .mount() mounts the handler as a raw fetch function, bypassing Elysia's
      // request processing (body parsing, context wrapping, etc.)
      // This is the official Better Auth integration method for Elysia
      .mount('/api/auth', auth.handler)
      .as('global')
  );
};
