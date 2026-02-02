# @metacult/backend-ranking ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Ranking** est responsable du calcul des scores de classement (Leaderboards) et de la gestion des duels entre médias (comparaisons A/B par les utilisateurs) pour établir une hiérarchie de qualité.

## Architecture

- **Domain** (`src/domain`):
  - `services/`: `EloCalculatorService` (Logique de calcul Elo standard).
- **Application** (`src/application`):
  - `commands/`: `UpdateEloScoreCommand` (Applique le résultat d'un duel).
  - `queries/`: `GetUserRankingsQuery` (Classement des utilisateurs les plus actifs/précis).
- **Infrastructure** (`src/infrastructure`):
  - `queue/`: `RankingQueue` (Traitement asynchrone des mises à jour de score pour ne pas bloquer l'interaction).
  - `repositories/`: Persistance des duels et historiques.

## API Publique

### Commands

- **`UpdateEloScoreCommand`** : Met à jour le score Elo de deux médias suite à un duel (Winner/Loser).

### Queries

- **`GetUserRankingsQuery`** : Récupère le classement global des utilisateurs (basé sur l'XP/Précision).

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-infrastructure`**
- **`@metacult/backend-interaction`** (Source des duels)
