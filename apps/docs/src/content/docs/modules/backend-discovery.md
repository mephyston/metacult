---
title: Backend-discovery
---

# @metacult/backend-discovery ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Discovery** est le moteur de recommandation de Metacult. Il calcule les affinités entre utilisateurs, les similarités entre œuvres (Item-Item Collaborative Filtering) et génère les flux personnalisés (Feeds).

## Architecture

- **Domain** (`src/domain`):
  - `entities/`: `Affinity` (User/User) et `Neighbor` (Media/Media).
  - `services/`: `SimilarityCalculator` (Jaccard/Cosine), `PersonalAffinityService`.
- **Application** (`src/application`):
  - `commands/`: `UpdateAffinityCommand` (Recalcul temps réel), `ComputeNeighbors` (Batch).
  - `queries/`: Stratégies de feed (`GetPersonalizedFeed`, `GetMixedFeed`, `GetTrending`, `GetUpcoming`).
- **Infrastructure** (`src/infrastructure`):
  - `repositories/`: Stockage vectoriel ou relationnel des scores.

## API Publique

### Commands

- **`UpdateAffinityCommand`** : Met à jour le score d'affinité entre deux utilisateurs suite à des interactions communes.
- **`ComputeNeighborsService`** : (Batch) Calcule les voisins les plus proches pour un média donné.

### Queries

- **`GetPersonalizedFeedQuery`** : Flux principal basé sur l'affinité sociale (recommandations des "âmes sœurs").
- **`GetMixedFeedQuery`** : Flux hybride (Legacy + New + Trending) pour l'onboarding.
- **`GetTrendingQuery`** / **`GetUpcomingQuery`** : Flux éditorialisés automatisés.

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-catalog`** (Pour les métadonnées des médias recommandés)
- **`@metacult/backend-infrastructure`**
