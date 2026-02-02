# @metacult/backend-infrastructure ![Type: Backend Infra](https://img.shields.io/badge/Type-Backend%2FInfra-grey)

## Responsabilité

Le module **Infrastructure** fournit les briques techniques transverses utilisées par tous les autres modules backend. Il isole l'accès aux ressources systèmes (Base de données, Cache, Files d'attente, Logs).

## Architecture

Ce module est organisé en librairies techniques (`src/lib`) :

- **DB** (`lib/db`): Client Drizzle ORM singleton et scripts de migration.
- **Logger** (`lib/logger`): Service de logging structuré (Pino/Winston).
- **Config** (`lib/config`): Gestion centralisée des variables d'environnement (`ConfigurationService`).
- **Cache** (`lib/cache`): Abstraction pour le caching (Redis).
- **Queue** (`lib/queue`): Client pour les files de messages asynchrones.

## API Publique

Ce module expose principalement des singletons et des clients :

### Services

- **`logger`** : Instance globale du logger.
- **`configService`** : Accès typé à la configuration (Zod validé).
- **`cacheService`** : Méthodes `get`, `set`, `del` pour le cache.

### Clients

- **`db`** : Client Drizzle configuré.
- **`migrate`** : Utilitaire de migration.

## Dépendances

- **`@metacult/shared-core`**
