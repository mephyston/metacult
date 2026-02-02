---
title: Backend-identity
---

# @metacult/backend-identity ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Identity** gère l'authentification (AuthN), l'autorisation (AuthZ) et la gestion des comptes utilisateurs. Il sert de socle de sécurité pour l'ensemble de l'API.

## Architecture

Ce module suit une architecture pragmatique, déléguant la complexité à **Better Auth**.

- **Domain** (`src/domain`):
  - `value-objects/`: `UserId`.
  - _Note : Pas d'entité `User` riche, le modèle est défini par le schéma DB._
- **Infrastructure** (`src/infrastructure`):
  - `auth/`: Wrapper autour de la librairie **Better Auth**.
  - `db/`: Schémas Drizzle (`user`, `session`, `account`, `verification`).
- **API** (`src/api`):
  - `middleware/`: middlewares ElysiaJS pour protéger les routes (`isAuthenticated`, `maybeAuthenticated`).
  - `helpers/`: Utilitaires d'extraction de contexte (`resolveUserOrThrow`).
  - `http/`: Contrôleur pour le profil utilisateur.

## API Publique

### Middlewares & Helpers

- **`isAuthenticated`** : Middleware ElysiaJS qui valide la session et injecte `user` et `session` dans le contexte.
- **`resolveUserOrThrow`** : Helper pour garantir l'accès à un utilisateur authentifié dans les services.

### Infrastructure

- **`identitySchema`** : Export des schémas de base de données pour les migrations globales.
- **`auth`** : Instance client Better Auth.

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-infrastructure`** (Base de données)
