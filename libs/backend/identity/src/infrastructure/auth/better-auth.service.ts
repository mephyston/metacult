import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import {
  getDbConnection,
  configService,
} from '@metacult/backend-infrastructure';
import { user, session, account, verification } from '../db/auth.schema';

// const { db } = getDbConnection();

/**
 * Configuration du domaine racine pour le partage de cookies entre sous-domaines.
 * En production : `.metacult.gg` (le point initial permet le partage avec app.metacult.gg, www.metacult.gg, etc.)
 * En staging Railway : undefined (pas de cross-domain possible entre .up.railway.app différents)
 * En développement : `localhost`
 */
const rootDomain = configService.rootDomain;
const cookiePrefix = configService.authCookiePrefix || 'metacult';

/**
 * Configuration du service d'authentification (Better Auth).
 *
 * Gère les sessions, les comptes OAuth et les utilisateurs via Drizzle.
 * Utilise le schéma PostgreSQL 'identity' pour isoler les tables d'auth.
 * Configure les cookies pour être partagés entre sous-domaines (metacult.gg ↔ app.metacult.gg).
 *
 * @see https://better-auth.com/docs
 */
export let auth: any; // eslint-disable-line @typescript-eslint/no-explicit-any

export const initAuth = () => {
  if (auth) return auth;

  const secret = configService.betterAuthSecret;
  const baseURL = configService.betterAuthUrl;

  // Ensure DB is initialized (by caller, but we get the instance here)
  const { db } = getDbConnection();

  auth =
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
            ...(configService.betterAuthTrustedOrigins
              ? configService.betterAuthTrustedOrigins
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
        ({} as unknown as never);

  return auth;
};

/**
 * Type du client Better Auth exposé.
 */
export type AuthClient = typeof auth;
