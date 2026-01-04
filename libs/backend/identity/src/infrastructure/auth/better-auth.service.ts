import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  getDbConnection,
  configService,
} from '@metacult/backend-infrastructure';
import { user, session, account, verification } from '../db/auth.schema';

const { db } = getDbConnection();

/**
 * Configuration du domaine racine pour le partage de cookies entre sous-domaines.
 * En production : `.metacult.gg` (le point initial permet le partage avec app.metacult.gg, www.metacult.gg, etc.)
 * En staging Railway : undefined (pas de cross-domain possible entre .up.railway.app différents)
 * En développement : `localhost`
 */
const rootDomain = configService.get('ROOT_DOMAIN');
const cookiePrefix = configService.get('AUTH_COOKIE_PREFIX') || 'metacult';

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
  baseURL: configService.get('BETTER_AUTH_URL'),
  basePath: '/api/auth',
  secret: configService.get('BETTER_AUTH_SECRET'),
  trustedOrigins: [
    ...(configService.isDevelopment
      ? [
          'http://localhost:3000', // API: Default port
          'http://localhost:4444', // Website dev fallback
          'http://localhost:4201', // Webapp Nuxt
        ]
      : []),
    ...(configService.get('BETTER_AUTH_TRUSTED_ORIGINS')
      ? configService.get('BETTER_AUTH_TRUSTED_ORIGINS')!.split(',')
      : []),
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
    useSecureCookies: configService.isProduction,
    defaultCookieAttributes: {
      domain: rootDomain, // Permet le partage cross-subdomain si défini
    },
  },
});

/**
 * Type du client Better Auth exposé.
 */
export type AuthClient = typeof auth;
