import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getDbConnection } from '../db/client';
import { user, session, account, verification } from '../db/schema/auth.schema';

const { db } = getDbConnection();

/**
 * Configuration du service d'authentification (Better Auth).
 * Gère les sessions, les comptes OAuth et les utilisateurs via Drizzle.
 */
export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: ['http://localhost:3333', 'http://localhost:5173', 'http://localhost:4444'],
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
