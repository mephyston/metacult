---
applyTo: '**'
---
## Standard: NX Monorepo Architecture Standards

Architecture et bonnes pratiques pour organiser un monorepo NX scalable avec boundaries enforcement et optimisation des builds. :
* Activer le cache NX avec cache: true dans targetDefaults pour optimiser les rebuilds.
* Appliquer le tag system NX pour enforcer les boundaries entre modules.
* Chaque Bounded Context expose un barrel file (index.ts) strict avec API publique uniquement.
* Configurer paths dans tsconfig.base.json pour import aliases clairs et lisibles.
* Configurer project.json avec tags pour chaque lib/app selon son scope et type.
* Documenter l'architecture du monorepo dans AGENTS.md ou ARCHITECTURE.md à la racine.
* Éviter les import circulaires en analysant régulièrement avec nx graph pour détecter les cycles.
* Limiter les dépendances cross-layer avec @nx/enforce-module-boundaries dans eslint config.
* Organiser le monorepo en apps/ (applications déployables) et libs/ (modules réutilisables).
* Organiser les libs backend en Bounded Contexts (DDD) isolés et autonomes.
* Préférer bunx nx run-many -t build pour build parallèle de plusieurs projets.
* Structurer libs/ par couche technique : backend/, shared/, frontend/ pour séparation des responsabilités.
* Utiliser implicitDependencies pour forcer rebuild si fichier racine modifié.
* Utiliser nx affected en CI/CD pour build uniquement les projets modifiés depuis la branche de base.
* Utiliser nx.json pour définir les targetDefaults globaux applicables à tous les projets.

Full standard is available here for further request: [NX Monorepo Architecture Standards](../../.packmind/standards/nx-monorepo-architecture-standards.md)