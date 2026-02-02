// ===== DOMAIN (Public API) =====
export * from './domain/value-objects/user-id.vo';

// ===== API (Presentation Layer) =====
export { createAuthRoutes } from './api/auth.routes';
export { userController } from './api/http/controllers/user.controller';
export {
  isAuthenticated,
  maybeAuthenticated,
  type AuthenticatedContext,
  type ProtectedRoute,
} from './api/middleware/auth.middleware';
export { resolveUserOrThrow } from './api/helpers/auth.helper';

// ===== INFRASTRUCTURE (Configuration & Initialization) =====
export {
  auth,
  initAuth,
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
