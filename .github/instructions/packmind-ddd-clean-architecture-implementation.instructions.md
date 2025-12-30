---
applyTo: '**'
---
## Standard: DDD Clean Architecture Implementation

Application pratique de DDD et Clean Architecture avec structure en couches, Value Objects, Entities et Ports/Adapters. :
* Créer des Domain Services pour logique complexe impliquant plusieurs entités.
* Créer des Entities avec logique métier (Game extends Media, Movie extends Media).
* Créer des Mappers dans Infrastructure pour convertir Domain vers DTO.
* Définir des Domain Exceptions pour les règles métier (MediaAlreadyExistsError).
* Définir des Ports (interfaces) dans application/ports (IMediaRepository).
* Injecter la configuration via paramètres (pas process.env dans les Factories).
* La couche Application contient les Use Cases (Commands/Queries - CQRS).
* La couche Domain ne doit avoir AUCUNE dépendance externe (pure TypeScript).
* La couche Infrastructure implémente les Adapters (DrizzleMediaRepository).
* Le barrel file index.ts expose UNIQUEMENT l'API publique (pas les implémentations).
* Le Composition Root (apps/api/index.ts) est le SEUL endroit qui lit process.env.
* Organiser les tests par couche avec fichiers .spec.ts adjacents au code source.
* Structurer chaque Bounded Context en 4 couches : domain, application, infrastructure, api.
* Utiliser Constructor Injection dans les Handlers/Services pour faciliter les tests.
* Utiliser des Factories pour créer les dépendances (CatalogModuleFactory).
* Utiliser des Value Objects pour encapsuler la validation (Rating, CoverUrl, etc.).
* Utiliser l'Anti-Corruption Layer (Adapters) pour isoler les APIs tierces.
* Valider les données externes avec Type Guards natifs (pas Zod en Domain/Application).

Full standard is available here for further request: [DDD Clean Architecture Implementation](../../.packmind/standards/ddd-clean-architecture-implementation.md)