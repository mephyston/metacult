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
      // Délègue toutes les routes à Better Auth
      .all('/*', ({ request }) => auth.handler(request))
      .as('global')
  );
};
