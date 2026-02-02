---
title: Backend-commerce
---

# @metacult/backend-commerce ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Commerce** est responsable de l'agrégation et de la standardisation des offres commerciales (achat, location, streaming) pour les médias. Il gère également la génération de liens d'affiliation.

## Architecture

- **Domain** (`src/domain`): Définit l'entité `Offer` et le `AffiliateLinkService` qui contient la logique de monétisation.
- **Application** (`src/application`):
  - `queries/`: `GetOffersQuery` pour récupérer les offres disponibles pour un média donné.
  - `gateway/`: Interface `OffersProvider` abstraite.
- **Infrastructure** (`src/infrastructure`):
  - `tmdb/`: Implémentation du provider d'offres via l'API TMDB ("Watch Providers").
  - `db/`: Persistance locale si nécessaire.
- **API** (`src/api`): Endpoints pour exposer les offres au frontend.

## API Publique

### Queries

- **`GetOffersQuery`** : Récupère la liste des plateformes (Netflix, Steam, etc.) où un média est disponible, avec les liens d'affiliation générés.

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-infrastructure`**
