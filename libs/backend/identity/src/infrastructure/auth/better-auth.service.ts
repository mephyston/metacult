import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDbConnection } from '@metacult/backend-infrastructure';
import { user, session, account, verification } from '../db/auth.schema';

const { db } = getDbConnection();

/**
 * Configuration du service d'authentification (Better Auth).
 * 
 * Gère les sessions, les comptes OAuth et les utilisateurs via Drizzle.
 * Utilise le schéma PostgreSQL 'identity' pour isoler les tables d'auth.
 * 
 * @see https://better-auth.com/docs
 */
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [
        'http://localhost:3333', // API
        'http://localhost:5173', // Webapp dev
        'http://localhost:4444'  // Website dev
    ],
    database: drizzleAdapter(db, {
        provider: 'pg',
        schema: {
            user,
            session,
            account,
            verification
        },
    }),
    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    advanced: {
        cookiePrefix: 'metacult'
    }
});

/**
 * Type du client Better Auth exposé.
 */
export type AuthClient = typeof auth;
