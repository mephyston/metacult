# @metacult/backend-identity

Bounded Context pour la gestion de l'**Authentification** et de l'**Identité** des utilisateurs.

## 📦 Responsabilités

- Authentification (email/password, OAuth via Better Auth)
- Gestion des sessions utilisateur
- Middleware de protection des routes API
- Schemas Drizzle pour les tables d'authentification (schéma PostgreSQL `identity`)

## 🏗️ Architecture

Respecte les principes **DDD + Clean Architecture** avec 4 couches :

```
libs/backend/identity/
├── src/
│   ├── domain/          # Entities, Value Objects (vide pour l'instant, Better Auth gère)
│   ├── application/     # Use Cases, Commands, Queries (vide, auth délégué à Better Auth)
│   ├── infrastructure/  # Adapters techniques
│   │   ├── db/         # Schemas Drizzle (auth.schema.ts)
│   │   └── auth/       # Better Auth service
│   └── api/            # Routes HTTP & Middleware Elysia
│       ├── auth.routes.ts      # Routes publiques /api/auth/*
│       └── middleware/
│           └── auth.middleware.ts  # Plugin isAuthenticated
└── index.ts            # API publique (barrel file)
```

## 🚀 Usage

### 1. Monter les routes d'authentification

```typescript
import { createAuthRoutes } from '@metacult/backend-identity';

const app = new Elysia()
  .use(createAuthRoutes()) // Monte /api/auth/sign-in, /api/auth/sign-up, etc.
```

### 2. Protéger une route avec le middleware

```typescript
import { isAuthenticated, type ProtectedRoute } from '@metacult/backend-identity';

const app = new Elysia()
  .use(isAuthenticated)
  .get('/protected', ({ user, session }: ProtectedRoute) => {
    return { message: `Hello ${user.name}`, userId: user.id };
  });
```

### 3. Vérifier une session manuellement

```typescript
import { auth } from '@metacult/backend-identity';

const sessionData = await auth.api.getSession({
  headers: request.headers
});

if (sessionData?.user) {
  console.log('User authenticated:', sessionData.user.email);
}
```

## 📝 Schemas Drizzle

Les tables sont isolées dans le schéma PostgreSQL `identity` :

- `identity.user` - Utilisateurs
- `identity.session` - Sessions actives
- `identity.account` - Comptes liés (OAuth)
- `identity.verification` - Tokens de vérification email

```typescript
import { user, session } from '@metacult/backend-identity';

// Usage dans Drizzle queries
await db.select().from(user).where(eq(user.email, 'test@example.com'));
```

## 🔗 Dépendances

- `@metacult/backend-infrastructure` (DB client, Redis)
- `better-auth` (Auth service)
- `elysia` (HTTP framework)
- `drizzle-orm` (ORM)

## 📚 Références

- [Better Auth Documentation](https://better-auth.com/docs)
- [DDD Clean Architecture (AGENTS.md)](../../../AGENTS.md)

