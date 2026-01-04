/**
 * Routes d'Authentification (Better Auth).
 * 
 * REFACTORED: Les routes sont maintenant gérées par le module @metacult/backend-identity.
 * Ce fichier re-exporte simplement pour compatibilité avec apps/api/index.ts.
 * 
 * @deprecated Importer directement depuis @metacult/backend-identity
 */
export { createAuthRoutes as authRoutes } from '@metacult/backend-identity';
