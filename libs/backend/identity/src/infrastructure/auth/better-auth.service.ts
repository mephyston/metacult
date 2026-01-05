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
// Safe Initialization: Check if Critical Secrets are present
// Prevents Worker from crashing when importing this module implicitly (via repositories)
const secret = configService.get('BETTER_AUTH_SECRET');
const baseURL = configService.get('BETTER_AUTH_URL');

export const auth =
  secret && baseURL
    ? betterAuth({
        baseURL: baseURL,
        basePath: '/api/auth',
        secret: secret,
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
      })
    : // Return a proxy/mock that throws if accessed? Or just a dummy object?
      // Since usage is only in API which has secrets, this branch is only hit by Worker which DOES NOT use it.
      // Returning a dummy strictly to satisfy export type.
      ({} as any);

/**
 * Type du client Better Auth exposé.
 */
export type AuthClient = typeof auth;
