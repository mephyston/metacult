---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - /Users/david/Lab/metacult/metacult/_bmad-output/planning-artifacts/prd.md
  - /Users/david/Lab/metacult/metacult/_bmad-output/planning-artifacts/ux-design-specification.md
  - /Users/david/Lab/metacult/metacult/docs/architecture.md
  - /Users/david/Lab/metacult/metacult/docs/project-overview.md
workflowType: 'architecture'
project_name: 'metacult'
user_name: 'David'
date: '2026-01-08'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

- **Core Loop** : Agrégation de verticales (Films, Jeux) -> `Stack` unifié.
- **Architecture de Données** : Nécessite une table de jointure `UserDailyFeed` pré-calculée (Batch) pour garantir la performance, plutôt que des requêtes dynamiques complexes.
- **Sync Manager** : Moteur de synchronisation bidirectionnel robuste (Outbox Pattern) pour gérer les états "Optimist" (Like/Dislike) avant confirmation serveur.

**Non-Functional Requirements (High Risk):**

- **Offline Resilience** : Gestion explicite des erreurs de Quota Storage (IndexedDB). Mode dégradé requis.
- **Consistency** : Consistance événementielle (Eventual Consistency) acceptée pour les scores ELO et les Stats, mais consistance stricte pour l'inventaire (Wishlist).

**Scale & Complexity:**

- **Domaine Principal** : High-Performance Consumer PWA.
- **Complexité** : Élevée (Sync Engine, Physique UI, Batch Jobs massifs).
- **Composants Clés** :
  1.  **API Gateway** (Stateless)
  2.  **Worker Cluster** (ELO calc + Feed Generation)
  3.  **PWA Client** (Local Database + Sync Engine)

### Technical Constraints & Dependencies

1.  **Business Constraint** : PWA obligatoire (évitement taxe App Store).
2.  **Runtime Constraint** : Bun pour tout (Uniformité Ops).
3.  **Latency Budget** : 16ms pour interactions UI, 50ms pour API Reads (d'où le choix du Batching).

### Cross-Cutting Concerns Identifiés

1.  **Optimistic UI Pattern** : Standardiser la gestion d'état (Action immédiate -> UI Update -> Background Sync -> Revert si erreur).
2.  **Shared Types (End-to-End)** : Utilisation intensive de l'inférence de types Elysia <-> Nuxt pour garantir la sécurité du typage sans duplication.
3.  **Idempotency** : Tous les endpoints d'écriture (`/interaction/*`) doivent supporter des `idempotency-keys` pour gérer les retries automatiques du client PWA.

## Technological Foundation (Brownfield)

### Core Stack Strategy (Split-Stack)

L'architecture repose sur une séparation claire des responsabilités entre l'App (Riche) et le Site (SEO), unifiée par le Monorepo Nx :

**1. The App Endpoint (`apps/webapp`) - Nuxt 3**

- **Role** : PWA "Thick Client" (Client Lourd).
- **Use Case** : Le "Rituel Quotidien", le Swipe, les Duels, la gestion de profil.
- **Why Nuxt?** :
  - **Interactivité** : Gestion d'état complexe (Pinia) et transitions de pages fluides ("View Transitions API").
  - **Architecture** : Capacité à intégrer profondément les Service Workers pour le mode Offline-First.
  - **Performance** : SPA Mode après le premier chargement pour une navigation instantanée.

**2. The Public Portal (`apps/website`) - Astro**

- **Role** : Annuaire SEO et Landing Marketing.
- **Use Case** : Pages publiques des films/jeux (ex: `/movie/dune-2`), Blog, Landing Page.
- **Why Astro?** :
  - **SEO & Speed** : Génération statique (SSG) de milliers de pages d'annuaire (Directory) pour capter le trafic de recherche (Long Tail).
  - **Islands** : Zéro JS par défaut, chargement partiel de composants interactifs si nécessaire.

### Critical Gaps to Bridge (PWA Retrofit)

Pour transformer l'existant en PWA "Culture Flow" performante, nous devons combler ces manques :

- **Local Persistence Layer (`libs/shared/local-db`)** :
  - **Manquant** : Pas de stockage structuré client.
  - **Décision** : Intégration de **Dexie.js** (IndexedDB Wrapper) pour stocker le `DailyStack` et les actions en attente.
- **Sync Engine (`libs/shared/sync`)** :
  - **Manquant** : Pas de gestion offline/online.
  - **Décision** : Implémentation du pattern **Transactional Outbox**.
- **Worker Scalability** :
  - **Validation** : BullMQ est validé pour gérer la génération massive de stacks la nuit (Batch processing) sans impacter l'API temps réel.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Offline & Persistence):**

- **Local DB**: Dexie.js (IndexedDB Wrapper) vs PGLite vs RxDB. -> **Dexie.js** selected.
- **Sync Strategy**: Custom Outbox vs Service Worker Sync. -> **Custom Transactional Outbox** selected.
- **Framework Split**: Nuxt vs Astro for PWA. -> **Nuxt** confirmed for PWA capability.

### Data Architecture (The "Local-First" Pivot)

**1. Local Persistence: Dexie.js**

- **Decision**: Utilisation de Dexie.js (`libs/shared/local-db`) comme source de vérité unique pour l'UI du Deck.
- **Rationale**: Légèreté (vs PGLite qui est lourd) et suffisance pour stocker des documents JSON (le stack).
- **Flow**: L'API fetch le stack -> Stocke dans Dexie -> L'UI lit Dexie. L'UI ne lit JAMAIS l'API directement.

### Authentication & Security

**1. Hybrid Auth Strategy**

- **State**: `BetterAuth` gère la session serveur (HttpOnly Cookie).
- **Offline Support**: Le token de session (ou une clé dérivée) doit être persisté localement (Secure Storage) pour permettre le démarrage de l'app sans réseau (même si le refresh token échoue).

### API & Communication Patterns

**1. The "Transactional Outbox" Pattern (`libs/shared/sync`)**

- **Problem**: Garantir qu'aucun swipe n'est perdu si le réseau coupe.
- **Solution**:
  1.  User Swipe (Right)
  2.  Write to Dexie `pending_actions` table (State = PENDING).
  3.  UI Update (Optimistic).
  4.  SyncManager détecte `onLine`.
  5.  Appel API (`POST /interactions`).
  6.  Si Success: Delete from `pending_actions`. Si Fail: Retry with exponential backoff.

### Frontend Architecture

**1. Framework Decision: Nuxt 3 (SPA Mode)**

- **Validation**: Confirmation que Astro n'est pas adapté pour la complexité de gestion d'état du Deck (Stateful). Nuxt est maintenu pour l'App.
- **Image Strategy**: Pré-chargement agressif des assets. Utilisation de l'API `Cache Storage` (Service Worker) pilotée par le composant `SwipeDeck` pour cacher les 20 images du stack actuel + prochain.

### Infrastructure & Deployment

**1. Worker-First Processing**

- **Constraint**: Le calcul ELO et la génération de Stack sont trop lents pour le cycle Request/Response.
- **Decision**: Tout traitement > 50ms est délégué à BullMQ (`apps/worker`). L'API ne fait que de l'Ingest (produire l'événement).

### Decision Impact Analysis

**Implementation Sequence:**

1.  **Shared Libs**: Créer `local-db` (Dexie) et `sync` (interface) avant toute UI.
2.  **API Idempotency**: Mettre à jour les contrôleurs pour accepter `idempotency-key`.
3.  **UI Integration**: Brancher le `SwipeDeck` sur Dexie, pas sur `useFetch`.

## Implementation Patterns & Consistency Rules

### Critical Consistency Rules (The "Law of the Code")

Ces règles sont inviolables pour garantir que les agents Backend et Frontend travaillent en symbiose unifiée via le Monorepo Nx.

**1. The "Dual-Type" Rule (Type Safety)**

- **Backend Definition**: Le Backend est la seule source de vérité des types.
  - _Implementation_: Utilisation stricte de `TypeBox` (Elysia) pour définir les Schémas DTO.
- **Frontend Consumption**: Le Frontend **NE REDÉFINIT JAMAIS** les interfaces.
  - _Implementation_: Utilisation de l'inférence via `Eden Treaty` (`App.server`).
  - _Enforcement_: CI check qui échoue si une `interface User` est détectée dans `/apps/webapp`.

**2. The "Local-First" Data Flow (Unidirectional)**
Pour l'application connectée (`apps/webapp`), le flux de données doit respecter la contrainte Offline :

- ❌ **Interdit** : Composant UI -> `await $fetch('/api/stack')`. (Couplage fort au réseau).
- ✅ **Obligatoire** : Composant UI -> `liveQuery(() => localDb.stack...)`. (Réactivité locale).
- _Pattern_: "Sync-Behind". Un service d'arrière-plan peuple la DB locale. L'UI est agnostique du réseau.

### Application Boundary Pattern (Nuxt vs Astro)

Clarification de la séparation des responsabilités :

- **Private Realm (`apps/webapp` - Nuxt)** :
  - Gère **TOUTE** l'expérience utilisateur authentifiée.
  - Inclut : Le Deck (Mobile), Le Gestionnaire de Collection (Desktop), Les Paramètres.
  - _Pourquoi_ : Partage de session, Drag & Drop complexe, State Pinia partagé.
- **Public Realm (`apps/website` - Astro)** :
  - Gère **UNIQUEMENT** le contenu public accessible aux robots (SEO).
  - Inclut : Landing, Blog, Annuaire (`/movie/dune`).
  - _Interaction_ : Le bouton "Login" ou "Ajouter à ma liste" renvoie vers l'app Nuxt.

### Naming & Structure Conventions

**1. Domain-Driven Structure (`libs/backend`)**

- Organization: `libs/backend/{domain-name}`.
- Naming:
  - Services: `{Verb}{Entity}Service` (ex: `CalculateEloService`).
  - Events: `{Domain}.{Entity}.{State}` (ex: `Interaction.Vote.Committed`).

**2. Error Handling (No "Oups")**

- **Protocol**: API retourne format RFC 7807 (`ProblemDetails`).
- **UX Pattern**: "Silent Recovery".
  - Si une action échoue (ex: Like), l'UI ne bloque pas.
  - Le "SyncManager" retente (Exponential Backoff).
  - Si échec définitif après 24h : Notification toast "Action annulée" et rollback visuel discret.

### State Management Strategy

- **Hot State (Pinia)** : Pour ce qui est éphémère (Input de formulaire, position du curseur, animation en cours).
- **Cold State (Dexie)** : Pour tout ce qui doit survivre à un refresh (Stack, User Profile, Settings).
- **Hydration** : Au montage (`app.vue`), Pinia s'hydrate depuis Dexie, pas depuis l'API.

## Project Structure & Boundaries

L'architecture Metacult est implémentée comme un **Modular Monolith** via Nx. Chaque dossier a une responsabilité unique et des frontières d'accès strictes.

### Complete Project Directory Structure

```bash
metacult/
├── apps/
│   ├── api/                    # [Backend] ElysiaJS Gateway (Stateless)
│   │   ├── src/controllers/    # HTTP Controllers only (Routing)
│   │   └── src/plugins/        # Elysia Plugins (Auth, Swagger)
│   │
│   ├── worker/                 # [Backend] BullMQ Worker (Async Logic)
│   │   ├── src/processors/     # Job Handlers (EloCalc, FeedGen)
│   │   └── src/schedules/      # Cron Jobs
│   │
│   ├── webapp/                 # [Frontend] Nuxt 3 PWA (Private/Auth)
│   │   ├── components/
│   │   │   ├── deck/           # "Swipe" Features
│   │   │   ├── duel/           # "Versus" Features
│   │   │   └── collections/    # "Admin" Features
│   │   ├── pages/
│   │   │   ├── deck/           # /deck (Main Loop)
│   │   │   ├── duel/           # /duel (Multiplayer)
│   │   │   └── collections/    # /collections (Desktop View)
│   │   └── stores/             # Pinia (Hot State)
│   │
│   └── website/                # [Frontend] Astro Site (Public/SEO)
│       └── pages/
│           └── movie/          # /movie/[slug] (SSG)
│
└── libs/
    ├── backend/                # [Domain] Pure TypeScript Business Logic
    │   ├── identity/           # Users, Auth
    │   ├── catalog/            # Movies, Games, Import
    │   └── interaction/        # Elo, Votes, Matches
    │
    └── shared/                 # [Universal] Code shared between Apps
        ├── core/               # Utils, Validation, Date (Isomorphic)
        ├── types/              # Eden Treaty (TypeBox DTOs)
        ├── ui/                 # Vue Design System (Dumb Components)
        ├── local-db/           # Dexie.js Wrapper (Client Persistence) [NEW]
        └── sync/               # Outbox Pattern Engine (Client Logic) [NEW]
```

### Architectural Boundaries & Integration

**1. API Boundary (The "Eden" Wall)**

- **Rule**: `apps/webapp` ne doit JAMAIS importer `libs/backend` directement.
- **Bridge**: L'interface se fait uniquement via `libs/shared/types` (Contrat) et l'appel réseau ou la synchro.

**2. The Offline Boundary**

- **Rule**: Les pages critiques (`/deck`, `/duel`) ne doivent pas faire d'appels `fetch` bloquants au chargement.
- **Implementation**:
  - `Page Load` -> Lit `libs/shared/local-db` (Instantané).
  - `Background` -> `libs/shared/sync` fetch les nouveautés et update la DB.

**3. The Public/Private Wall**

- **Astro (`website`)** : N'a **AUCUNE** connaissance de la session utilisateur ou de la DB locale. Il affiche du contenu statique.
- **Nuxt (`webapp`)** : Gère toute la logique "Connecté".
- **Passage** : Les liens `Gérer ma collection` sur le site public sont des liens HTTP classiques (`<a href="app.metacult.co">`) qui déclenchent un chargement complet de l'app PWA.

### Feature Mapping

- **F01 - The Swipe** : `apps/webapp/components/deck` + `libs/shared/local-db`.
- **F02 - The Duel** : `apps/webapp/components/duel` + `libs/backend/interaction`.
- **F03 - Affiliate Links** : `apps/website/components/ads` (SEO-friendly) + `apps/webapp` (Contextual).
- **Scaling ELO** : `libs/backend/interaction` (Algorithm) exilé dans `apps/worker` pour ne pas bloquer l'API.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
L'architecture "Split-Stack" (Astro/Nuxt) couplée à un pattern "Offline-First strict" (Dexie/Worker) est cohérente. Elle résout le dilemme "Performance UI vs SEO" en n'essayant pas de tout faire avec un seul outil.
L'utilisation de `BullMQ` pour décharger les calculs lourds (ELO, Feed Generation) protège la latence de l'API Gateway.

**Pattern Consistency:**
Le principe de "Dual-Type" (TypeBox/Eden) et de "Local-First Data Flow" assure une homogénéité du code. Les frontières sont claires :

- Le Frontend ne fait jamais de Business Logic complexe (c'est délégué au Worker).
- Le Backend ne gère jamais d'état de session UI (c'est délégué à Pinia/Dexie).

### Requirements Coverage Validation ✅

**Features Covered:**

- **F01 (The Swipe)** : Entièrement supporté par `apps/webapp/components/deck` + `local-db` (Performance < 16ms).
- **F02 (The Duel)** : Supporté par `libs/backend/interaction` pour l'arbitrage et `apps/webapp` pour l'interface.
- **F03 (Aggregation)** : Supporté par le Batch Nocturne (`apps/worker`) qui prépare la table `UserDailyFeed`.
- **Offline Support** : Garanti par le `libs/shared/sync` (Outbox Pattern).

**Gap Analysis & Resolution:**

- **Offline Auth Risk** : Comment démarrer l'app sans réseau si le cookie est HttpOnly ?
  - _Resolution_ : Pattern "Optimistic Auth". On stocke un flag `isAuthenticated` et le profil user dans Dexie. Au boot offline, on considère l'user loggé. Si le refresh token échoue une fois online, on force le logout.

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Key Strengths:**

1.  **Resilience** : L'app fonctionne dans le métro (Dexie).
2.  **Scalability** : Les calculs coûteux ne bloquent pas les utilisateurs (Workers).
3.  **Maintainability** : Types partagés, frontières strictes (Nx).

**Implementation Priority:**

1.  **Skeleton** : Initialiser le Monorepo Nx avec les 3 apps et les libs partagées.
2.  **Shared Libs** : Implémenter `libs/shared/types` et `libs/shared/local-db` en premier.
3.  **Auth & Sync** : Mettre en place le moteur de synchro avant de faire l'UI du Deck.

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Date Completed:** 2026-01-08
**Document Location:** `_bmad-output/planning-artifacts/architecture.md`

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions.
- Implementation patterns ensuring AI agent consistency.
- Complete project structure with all files and directories.
- Requirements to architecture mapping.
- Validation confirming coherence and completeness.

**🏗️ Implementation Ready Foundation**

- **Modular Monolith** architecture defined via Nx.
- **Split-Stack Strategy** (Nuxt PWA + Astro Site) validated.
- **Offline-First Patterns** (Dexie + Outbox) specified.

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions (Bun, Elysia, Nuxt, Drizzle).
- Consistency rules that prevent implementation conflicts (Dual-Type Rule).
- Project structure with clear boundaries (Public/Private Wall).
- Integration patterns and communication standards.

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing Metacult. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**

1.  **Skeleton**: Initialize Nx Monorepo with defined apps (`api`, `webapp`, `website`, `worker`).
2.  **Shared Libs**: Implement `libs/shared/types` (Eden Treaty) and `libs/shared/local-db` (Dexie).

**Development Sequence:**

1.  Initialize project using Nx.
2.  Set up `libs/shared` core modules.
3.  Implement Backend Domain Logic (`libs/backend`).
4.  Build Worker consumers.
5.  Implement Nuxt PWA features (`apps/webapp`) binding to Local DB.

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts (Split-Stack).
- [x] Technology choices are compatible (Bun + Elyisa + Nuxt).
- [x] Patterns support the architectural decisions (Local-First).
- [x] Structure aligns with all choices (Nx Monorepo).

**✅ Requirements Coverage**

- [x] All functional requirements are supported (Swipe, Duel, Collections).
- [x] All non-functional requirements are addressed (Offline, Performance).
- [x] Cross-cutting concerns are handled (Auth, Sync).
- [x] Integration points are defined (Eden Treaty).

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable.
- [x] Patterns prevent agent conflicts.
- [x] Structure is complete and unambiguous.
- [x] Examples are provided for clarity.

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction (especially the PWA constraints).

**🔧 Consistency Guarantee**
Implementation patterns and rules (like the "Dual-Type Rule") ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Generate Project Context & Begin Implementation.
