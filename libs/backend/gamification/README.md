# @metacult/backend-gamification ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Gamification** gère la boucle d'engagement des utilisateurs en récompensant leurs actions (XP) et en calculant leur progression (Niveaux). Il fonctionne de manière réactive par rapport aux autres modules.

## Architecture

- **Domain** (`src/domain`):
  - `entities/`: `UserStats` (voir documentation JSDoc : Aggregate Root gérant l'XP et les niveaux).
  - `ports/`: Interfaces pour la persistance.
- **Application** (`src/application`):
  - `listeners/`: `GrantXpOnInteractionListener` qui écoute les événements du module Interaction pour attribuer de l'XP de manière asynchrone.
  - `services/`: `GamificationService` pour la coordination.
- **Infrastructure** (`src/infrastructure`):
  - `repositories/`: Persistance des stats utilisateurs (Drizzle).
- **API** (`src/api`): Endpoints pour afficher le niveau et l'XP d'un utilisateur.

## API Publique

Ce module est principalement consommé via des **Domain Events**.

### Listeners

- **`GrantXpOnInteractionListener`** : Réagit aux créations d'interactions pour attribuer des points.

### Services

- **`GamificationService`** : Expose des méthodes pour récupérer les stats d'un utilisateur.

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-interaction`** (Source des événements)
- **`@metacult/backend-infrastructure`**
