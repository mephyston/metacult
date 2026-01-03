/**
 * @module @metacult/backend-identity
 *
 * Bounded Context: Identity (Authentification & Gestion Utilisateurs)
 *
 * **Responsabilités :**
 * - Authentification (email/password, OAuth)
 * - Gestion des sessions
 * - Middleware de protection des routes
 * - Schemas Drizzle pour les tables auth
 *
 * **API Publique :**
 * - `createAuthRoutes()` - Routes Better Auth
 * - `isAuthenticated` - Middleware Elysia pour routes protégées
 * - `auth` - Client Better Auth
 * - Schemas Drizzle (user, session, account, verification)
 * - Types (AuthenticatedContext, ProtectedRoute, SelectUser, etc.)
 */

// --- API Layer (Routes & Middleware) ---
export { createAuthRoutes } from './api/auth.routes';
export {
  isAuthenticated,
  maybeAuthenticated,
  type AuthenticatedContext,
  type ProtectedRoute,
} from './api/middleware/auth.middleware';
export { resolveUserOrThrow } from './api/helpers/auth.helper';

// --- Infrastructure Layer (Better Auth & Schemas) ---
export {
  auth,
  type AuthClient,
} from './infrastructure/auth/better-auth.service';
export {
  user,
  session,
  account,
  verification,
  identitySchema,
  type SelectUser,
  type InsertUser,
  type SelectSession,
  type InsertSession,
  type SelectAccount,
  type InsertAccount,
} from './infrastructure/db/auth.schema';
