Recipe pour créer un nouveau Bounded Context backend respectant DDD et Clean Architecture avec structure complète (domain, application, infrastructure, api)."}, {"name": "Ajouter tsconfig paths", "description": "Ajouter alias dans `tsconfig.base.json` paths : `@metacult/backend-<nom>`: [`libs/backend/<nom>/src/index.ts`]"}, {"name": "Créer les tests", "description": "Créer fichiers `.spec.ts` adjacents aux handlers et services avec tests unitaires. Mocker les repositories et providers."}, {"name": "Générer migration Drizzle", "description": "Exécuter `bun db:generate` pour générer migration SQL depuis schema. Vérifier fichier dans `libs/backend/infrastructure/drizzle/`."}, {"name": "Documenter dans AGENTS.md", "description": "Ajouter section dans AGENTS.md décrivant le nouveau Bounded Context, son rôle, ses dépendances et son API publique."}]

## When to Use

- Ajouter un nouveau domaine métier isolé (analytics, notifications, billing)
- Séparer une fonctionnalité complexe en module indépendant
- Respecter le principe de responsabilité unique (SRP) en DDD
- Créer un module avec sa propre base de données ou schéma dédié

## Context Validation Checkpoints

* [ ] Le domaine métier est-il clairement défini (ex: gestion des utilisateurs, facturation) ?
* [ ] Existe-t-il déjà un module similaire dans le projet (éviter duplication) ?
* [ ] Le module aura-t-il besoin de tables de base de données dédiées ?
* [ ] Le module dépendra-t-il d'autres Bounded Contexts (identifier les dépendances) ?
* [ ] Le module nécessite-t-il des APIs tierces (IGDB, TMDB, etc.) ?

## Recipe Steps

### Step 1: Créer la structure de dossiers

Créer `libs/backend/<nom>/src/{domain,application,infrastructure,api}` avec sous-dossiers appropriés (entities, value-objects, errors, commands, queries, repositories, adapters, providers, mappers).

### Step 2: Configurer project.json

Créer `libs/backend/<nom>/project.json` avec tags NX (`scope:backend`, `type:domain`, `module:<nom>`), targets lint et test, et sourceRoot correct.

### Step 3: Créer le barrel file

Créer `libs/backend/<nom>/src/index.ts` qui exporte UNIQUEMENT l'API publique (Domain entities/VOs, Application handlers, Factory, Routes). Ajouter commentaire pour marquer les exports interdits.

### Step 4: Définir les Entities

Créer `domain/entities/<nom>.entity.ts` avec classes d'entités contenant logique métier, validation et méthodes business. Utiliser l'héritage si nécessaire.

### Step 5: Créer les Value Objects

Créer `domain/value-objects/*.vo.ts` avec validation dans le constructeur. Chaque VO doit être immutable avec méthode getValue().

### Step 6: Définir les Domain Exceptions

Créer `domain/errors/<nom>.errors.ts` avec classes d'erreurs personnalisées étendant Error. Inclure métadonnées pertinentes (provider, id, etc.).

### Step 7: Créer les Domain Services

Créer `domain/services/<nom>.policy.ts` pour encapsuler la logique métier complexe impliquant plusieurs entités ou règles business.

### Step 8: Créer les Ports

Créer `application/ports/<nom>.repository.interface.ts` et `<nom>-provider.interface.ts` définissant les contrats que l'infrastructure doit implémenter.

### Step 9: Implémenter les Handlers

Créer `application/commands/<use-case>/<use-case>.handler.ts` et `application/queries/<use-case>/<use-case>.handler.ts` avec pattern CQRS. Utiliser Constructor Injection.

### Step 10: Créer les Adapters

Créer `infrastructure/repositories/drizzle-<nom>.repository.ts` implémentant IRepository. Créer `infrastructure/adapters/<provider>.adapter.ts` avec Anti-Corruption Layer.

### Step 11: Définir le schema Drizzle

Créer `infrastructure/db/<nom>.schema.ts` avec tables Drizzle (pgTable). Organiser en tables principales et relations.

### Step 12: Créer les Mappers

Créer `infrastructure/mappers/<nom>.mapper.ts` pour convertir entre Domain VOs et DTOs Infrastructure. Utiliser méthodes statiques.

### Step 13: Créer le Factory

Créer `application/factories/<nom>.factory.ts` avec méthodes statiques pour instancier Handlers et Controller. Accepter config en paramètre (pas process.env).

### Step 14: Créer les routes Elysia

Créer `api/routes.ts` avec Factory Function `createXxxRoutes(controller)`. Définir validation TypeBox inline. Utiliser Elysia.group() si multiple endpoints.

### Step 15: Exposer dans index.ts

Exporter Domain (entities, VOs, errors, services), Application (handlers, queries, commands, Factory, types), API (routes, controller). NE PAS exporter Infrastructure (repositories, adapters).

### Step 16: Wirer dans apps/api

Importer le Factory dans `apps/api/index.ts`, créer la config avec credentials depuis process.env, instancier controller, créer routes avec Factory, ajouter au app Elysia principal.
