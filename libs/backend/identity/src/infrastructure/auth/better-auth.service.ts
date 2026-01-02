import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { user, session, account, verification } from '../db/auth.schema';

const { db } = getDbConnection();

/**
 * Configuration du domaine racine pour le partage de cookies entre sous-domaines.
 * En production : `.metacult.gg` (le point initial permet le partage avec app.metacult.gg, www.metacult.gg, etc.)
 * En staging Railway : undefined (pas de cross-domain possible entre .up.railway.app différents)
 * En développement : `localhost`
 */
const rootDomain = process.env['ROOT_DOMAIN'];
const cookiePrefix =
  process.env['PUBLIC_AUTH_COOKIE_PREFIX'] ||
  process.env['AUTH_COOKIE_PREFIX'] ||
  'dev-metacult';

/**
 * Configuration du service d'authentification (Better Auth).
 *
 * Gère les sessions, les comptes OAuth et les utilisateurs via Drizzle.
 * Utilise le schéma PostgreSQL 'identity' pour isoler les tables d'auth.
 * Configure les cookies pour être partagés entre sous-domaines (metacult.gg ↔ app.metacult.gg).
 *
 * @see https://better-auth.com/docs
 */
export const auth = betterAuth({
  baseURL: process.env['BETTER_AUTH_URL'],
  basePath: '/api/auth',
  secret: process.env['BETTER_AUTH_SECRET'],
  trustedOrigins: [
    'http://localhost:3333', // API
    'http://localhost:4444', // Website dev fallback
    'http://localhost:4201', // Webapp Nuxt
  ],
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  advanced: {
    cookiePrefix: cookiePrefix,
    useSecureCookies: process.env['NODE_ENV'] === 'production',
    defaultCookieAttributes: {
      domain: rootDomain, // Permet le partage cross-subdomain si défini
    },
  },
});

/**
 * Type du client Better Auth exposé.
 */
export type AuthClient = typeof auth;
