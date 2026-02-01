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
      // CRITICAL: Mount at root since Better Auth config has basePath: '/api/auth'
      // Mounting at '/api/auth' would create double prefix: /api/auth/api/auth/*
      // Better Auth internally routes to configured basePath
      .mount(auth.handler)
      .as('global')
  );
};
