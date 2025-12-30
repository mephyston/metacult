# DDD Clean Architecture Implementation

Ce standard définit l'application concrète de DDD et Clean Architecture dans un projet backend. Il couvre la structure en 4 couches (domain/application/infrastructure/api), l'utilisation des Value Objects, Entities, Domain Services, Anti-Corruption Layer, CQRS, Repository Pattern, et l'isolation complète de la couche Domain. À appliquer sur tous les modules backend pour garantir maintenabilité, testabilité et évolutivité.

## Rules

* Structurer chaque Bounded Context en 4 couches : domain, application, infrastructure, api.
* La couche Domain ne doit avoir AUCUNE dépendance externe (pure TypeScript).
* Utiliser des Value Objects pour encapsuler la validation (Rating, CoverUrl, etc.).
* Créer des Entities avec logique métier (Game extends Media, Movie extends Media).
* Définir des Domain Exceptions pour les règles métier (MediaAlreadyExistsError).
* Créer des Domain Services pour logique complexe impliquant plusieurs entités.
* La couche Application contient les Use Cases (Commands/Queries - CQRS).
* Définir des Ports (interfaces) dans application/ports (IMediaRepository).
* La couche Infrastructure implémente les Adapters (DrizzleMediaRepository).
* Utiliser l'Anti-Corruption Layer (Adapters) pour isoler les APIs tierces.
* Créer des Mappers dans Infrastructure pour convertir Domain vers DTO.
* Le barrel file index.ts expose UNIQUEMENT l'API publique (pas les implémentations).
* Utiliser des Factories pour créer les dépendances (CatalogModuleFactory).
* Injecter la configuration via paramètres (pas process.env dans les Factories).
* Le Composition Root (apps/api/index.ts) est le SEUL endroit qui lit process.env.
* Valider les données externes avec Type Guards natifs (pas Zod en Domain/Application).
* Organiser les tests par couche avec fichiers .spec.ts adjacents au code source.
* Utiliser Constructor Injection dans les Handlers/Services pour faciliter les tests.
