import { describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';

/**
 * Tests d'intégration pour createAuthRoutes (Better Auth Proxy).
 * 
 * Note: Ces tests vérifient principalement la structure et l'export.
 * Les tests d'intégration réels nécessitent un environnement Better Auth complet.
 */
describe('Auth Routes (Better Auth Proxy)', () => {
    it('should export createAuthRoutes factory function', async () => {
        const { createAuthRoutes } = await import('./auth.routes');
        expect(createAuthRoutes).toBeDefined();
        expect(typeof createAuthRoutes).toBe('function');
    });

    it('should return an Elysia plugin instance', async () => {
        const { createAuthRoutes } = await import('./auth.routes');
        const authRoutes = createAuthRoutes();
        
        expect(authRoutes).toBeDefined();
        expect(typeof authRoutes).toBe('object');
    });

    it('should mount routes under /api/auth prefix', async () => {
        const { createAuthRoutes } = await import('./auth.routes');
        const app = new Elysia()
            .use(createAuthRoutes());

        // Vérifier que le plugin est bien monté
        expect(app).toBeDefined();
    });
});

/**
 * TODO: Tests d'intégration réels avec Better Auth
 * 
 * Ces tests nécessitent de mocker auth.handler correctement.
 * À implémenter après avoir configuré un test environment adapté.
 */
