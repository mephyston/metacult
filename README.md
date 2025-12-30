# Metacult Monorepo

Metacult est une plateforme de catalogage de médias (Jeux, Films, Séries, Livres) construite sur une architecture **Modular Monolith** stricte, respectant les principes de **Clean Architecture** et **Domain-Driven Design (DDD)**.

## 🏛️ Architecture & Standards

Ce projet ne fait aucun compromis sur la séparation des responsabilités.

### 1. Structure Modulaire (Modular Monolith)
L'application est divisée en modules métier autonomes (`catalog`, `discovery`, `identity`) situés dans `libs/backend`.
Chaque module expose :
- Une **API Publique** (`index.ts`) : Seuls les éléments nécessaires (DTOs, Façades) sont exportés.
- Une **Factory** : Point d'entrée unique pour instancier le module (Injection de Dépendances).

### 2. Clean Architecture (The Onion)
Chaque module respecte les couches concentriques :
1.  **Domain** (Cœur) : Entités, Value Objects, Domain Services, Erreurs Métier. **Aucune dépendance externe.**
2.  **Application** (Cas d'utilisation) : Commandes, Queries, Handlers, Ports (Interfaces). Orchestre le domaine.
3.  **Infrastructure** (Détails) : Implémentation des Ports (Repositories Drizzle, Adapters API externes).
4.  **Interface** (Entrée) : Contrôleurs HTTP (Elysia), Workers (BullMQ), CLI.

### 3. Domain-Driven Design (DDD)
- **Aggregates** : Les entités (ex: `Media`) garantissent la cohérence des invariants.
- **Value Objects** : Objets immuables (ex: `Rating`, `ExternalReference`) encapsulant la logique de validation.
- **Bounded Contexts** : Chaque module à son propre langage ubiquitaire.

---

## 👷 Focus : Architecture du Worker

Le **Worker** (`apps/worker`) est traité comme une **Interface de Présentation**, au même titre qu'un Contrôleur API.

### Principes Clés
1.  **Interdiction HTTP** : Le Worker ne "parle" pas à l'API via HTTP. Il instancie le module `catalog` directement en mémoire.
2.  **Agnostique de la DB** : Le Worker ne connaît pas le schéma de base de données. Il n'effectue aucune requête SQL.
3.  **Délégation Totale** : Son seul rôle est de :
    - Recevoir un Job.
    - Transformer les données en **Command** (DTO d'Application).
    - Appeler la méthode `execute()` du Handler via la **Factory Publique**.

### Flux d'Exécution (Exemple : Import)
1.  **Job** : `Queue` reçoit `{ type: 'game', id: '1942' }`.
2.  **Interface (Worker)** :
    - Instancie le module via `CatalogModuleFactory`.
    - Crée la commande `ImportMediaCommand('1942', GAME)`.
    - Appelle `handler.execute(command)`.
3.  **Application (Use Case)** :
    - Vérifie la politique d'import `MediaImportPolicy` (Doublons).
    - Appelle le port `IMediaProvider` pour récupérer les données externes.
    - Appelle le port `IMediaRepository` pour persister.
4.  **Infrastructure** :
    - `IgdbAdapter` appelle l'API IGDB.
    - `DrizzleMediaRepository` sauvegarde en PostgreSQL.

---

## 🛠️ Stack Technique

- **Runtime** : Bun
- **Monorepo** : Nx
- **Backend Frame** : ElysiaJS
- **Database** : PostgreSQL + Drizzle ORM
- **Queue** : Redis + BullMQ
- **Frontend** : Astro (Website) + Nuxt (Webapp)

## 🚀 Démarrage

```bash
# Installation
bun install

# Lancer la stack de développement (API + Worker + Frontends)
bun run dev

# Lancer Drizzle Studio (Explorateur DB)
bun db:studio
```
