# @metacult/backend-catalog ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Catalog** centralise la gestion référentielle des œuvres culturelles (Jeux, Films, Séries, Livres). Il est responsable de l'importation des métadonnées depuis des sources externes (IGDB, TMDB) et de la recherche unifiée de médias.

## Architecture

Structure conforme à la Clean Architecture :

- **Domain** (`src/domain`): Contient l'Aggregate Root `Media` (polymorphique) et les Value Objects (`Rating`, `ReleaseYear`). Déploie les règles de gestion (ex: unicité via `ExternalReference`).
- **Application** (`src/application`): Cas d'utilisation CQRS :
  - `commands/`: Logique d'écriture (Import de média).
  - `queries/`: Logique de lecture (Recherche, Listing).
  - `ports/`: Interfaces définissant les dépendances inversées (Repository, Providers).
- **Infrastructure** (`src/infrastructure`): Implémentations concrètes :
  - `repositories/`: Persistance via Drizzle ORM.
  - `providers/`: Adaptateurs tierces (IGDB, TMDB, Google Books).
- **API** (`src/api`): Contrôleurs HTTP et routes exposées (ex: ElysiaJS).

## API Publique

Les principaux points d'entrée CQRS du module :

### Commands

- **`ImportMediaCommand`** : Importe ou met à jour un média depuis une source externe (basé sur un ID externe).

### Queries

- **`SearchMediaQuery`** : Recherche full-text de médias avec filtres (type, année).

## Dépendances

Ce module s'appuie sur :

- **`@metacult/shared-core`** : Primitives partagées (Result, UUID, etc.).
- **`@metacult/backend-infrastructure`** : Socle technique (Logger, DB Client).
