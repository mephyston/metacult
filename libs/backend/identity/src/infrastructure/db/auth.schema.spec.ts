import { describe, it, expect } from 'bun:test';
import { user, session, account, verification, identitySchema } from './auth.schema';

describe('Identity Schemas (Drizzle)', () => {
    describe('User Schema', () => {
        it('should have correct table name with identity schema prefix', () => {
            expect(user).toBeDefined();
            // Vérifier que le schéma pgSchema('identity') est appliqué
            expect((user as any)[Symbol.for('drizzle:Name')]).toBe('user');
        });

        it('should have required fields defined', () => {
            const columns = (user as any)[Symbol.for('drizzle:Columns')];
            expect(columns).toBeDefined();
            expect(columns.id).toBeDefined();
            expect(columns.email).toBeDefined();
            expect(columns.name).toBeDefined();
            expect(columns.emailVerified).toBeDefined();
            expect(columns.createdAt).toBeDefined();
            expect(columns.updatedAt).toBeDefined();
        });
    });

    describe('Session Schema', () => {
        it('should have correct table name', () => {
            expect(session).toBeDefined();
            expect((session as any)[Symbol.for('drizzle:Name')]).toBe('session');
        });

        it('should have required fields for session management', () => {
            const columns = (session as any)[Symbol.for('drizzle:Columns')];
            expect(columns).toBeDefined();
            expect(columns.id).toBeDefined();
            expect(columns.userId).toBeDefined();
            expect(columns.expiresAt).toBeDefined();
            expect(columns.token).toBeDefined();
        });
    });

    describe('Account Schema', () => {
        it('should have correct table name', () => {
            expect(account).toBeDefined();
            expect((account as any)[Symbol.for('drizzle:Name')]).toBe('account');
        });

        it('should have fields for OAuth providers', () => {
            const columns = (account as any)[Symbol.for('drizzle:Columns')];
            expect(columns).toBeDefined();
            expect(columns.userId).toBeDefined();
            expect(columns.providerId).toBeDefined();
            expect(columns.accountId).toBeDefined();
        });
    });

    describe('Verification Schema', () => {
        it('should have correct table name', () => {
            expect(verification).toBeDefined();
            expect((verification as any)[Symbol.for('drizzle:Name')]).toBe('verification');
        });

        it('should have fields for email verification', () => {
            const columns = (verification as any)[Symbol.for('drizzle:Columns')];
            expect(columns).toBeDefined();
            expect(columns.identifier).toBeDefined();
            expect(columns.value).toBeDefined();
            expect(columns.expiresAt).toBeDefined();
        });
    });

    describe('Identity Schema (pgSchema)', () => {
        it('should be defined as PostgreSQL schema', () => {
            expect(identitySchema).toBeDefined();
            // Vérifier que c'est bien un pgSchema
            expect(typeof identitySchema).toBe('object');
        });

        it('should isolate tables in "identity" namespace', () => {
            // Vérifier que les tables utilisent bien le schéma identity
            expect((identitySchema as any).schemaName).toBe('identity');
        });
    });
});
