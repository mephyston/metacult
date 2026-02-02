# @metacult/backend-marketing ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Marketing** gère l'inventaire et la diffusion de contenus sponsorisés (publicités natives) au sein des flux de l'application.

## Architecture

- **Domain** (`src/domain`):
  - `Ad`: Entité représentant une publicité native.
- **Application** (`src/application`):
  - `queries/`: `GetActiveAdsQuery` pour récupérer les pubs à insérer dans le feed.
  - `ports/`: `AdsGatewayInterface` pour l'abstraction de la source de pubs.
- **Infrastructure** (`src/infrastructure`):
  - `adapters/`: `RedisAdsAdapter` (Simulation d'un AdServer rapide via Redis).

## API Publique

### Queries

- **`GetActiveAdsQuery`** : Récupère une liste de publicités actives pour un emplacement donné, prêtes à être injectées dans le `GetMixedFeed` du module Discovery.

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-infrastructure`** (Redis)
