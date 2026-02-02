---
title: Backend-interaction
---

# @metacult/backend-interaction ![Type: Backend Domain](https://img.shields.io/badge/Type-Backend%2FDomain-blue)

## Responsabilité

Le module **Interaction** capture et centralise les signaux explicites des utilisateurs (Likes, Dislikes, Wishlist). Ces signaux sont la source primaire de vérité pour le moteur de recommandation (Discovery) et la gamification.

## Architecture

- **Domain** (`src/domain`):
  - `entities/`: `UserInteraction` (Aggregate Root représentant un signal atomique).
  - `events/`: `InteractionSaved` (Publié pour informer les autres modules comme Gamification).
- **Application** (`src/application`):
  - `commands/`:
    - `SaveInteractionCommand` : Crée ou met à jour un signal utilisateur.
    - `SyncInteractionsCommand` : Synchronisation batch (legacy).
    - `SocialGraphCommand` : Gestion du graphe social.
- **Infrastructure** (`src/infrastructure`):
  - `repositories/`: Persistance SQL via Drizzle.
- **API** (`src/api`):
  - Endpoints pour soumettre un Like/Dislike (Swipes).

## API Publique

### Commands

- **`SaveInteractionCommand`** : Point d'entrée principal pour enregistrer une action utilisateur (Like/Dislike/Skip).
- **`SocialGraphCommand`** : Commandes liées aux relations follow/unfollow (si géré ici).

### Events

- **`InteractionSaved`** : Événement émis après chaque sauvegarde, écouté par Gamification (pour XP) et Discovery (pour recalcul affinité).

## Dépendances

- **`@metacult/shared-core`**
- **`@metacult/backend-infrastructure`**
- **`@metacult/backend-identity`** (Liaison utilisateur)
- **`@metacult/backend-catalog`** (Liaison média)
