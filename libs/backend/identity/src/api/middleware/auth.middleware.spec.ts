import { describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';
import type { AuthenticatedContext } from './auth.middleware';

/**
 * Tests d'intégration pour isAuthenticated middleware.
 *
 * Note: Ces tests nécessitent un environnement de test avec Better Auth configuré.
 * Pour l'instant, on teste uniquement les types et la structure.
 */
describe('isAuthenticated Middleware (Type Safety)', () => {
  it('should have correct AuthenticatedContext type definition', () => {
    const mockContext: AuthenticatedContext = {
      user: {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      session: {
        id: 'session-456',
        userId: 'user-123',
        expiresAt: new Date(),
        token: 'mock-token',
        ipAddress: '127.0.0.1',
        userAgent: 'Test Agent',
      },
    };

    expect(mockContext.user.id).toBe('user-123');
    expect(mockContext.session.token).toBe('mock-token');
  });

  it('should export isAuthenticated plugin', async () => {
    const { isAuthenticated } = await import('./auth.middleware');
    expect(isAuthenticated).toBeDefined();
    expect(typeof isAuthenticated).toBe('function');
  });
});

/**
 * TODO: Tests d'intégration réels avec Better Auth mock
 *
 * Ces tests nécessitent de mocker auth.api.getSession correctement.
 * À implémenter après avoir configuré un test environment adapté.
 */
