---
applyTo: '**'
---
## Standard: ElysiaJS + Bun Development Standards

Standards et bonnes pratiques pour le développement d'APIs backend avec ElysiaJS et Bun runtime. :
* Activer CORS avec @elysiajs/cors et configurer les origines autorisées explicitement.
* Activer strict mode dans ElysiaJS pour validation stricte des types.
* Configurer tsconfig.json avec "types": ["bun-types"] pour obtenir les types Bun.
* Créer des routes avec Factory Functions pour faciliter l'injection de dépendances.
* Définir les schemas TypeBox inline dans les routes pour validation automatique.
* Démarrer les applications avec bun run (pas node) pour bénéficier des optimisations du runtime natif.
* Préférer Constructor Injection dans les routes avec Factory Pattern.
* Utiliser bun build avec --target=bun pour optimiser les bundles pour le runtime Bun.
* Utiliser Bun.env au lieu de process.env pour accès optimisé aux variables d'environnement.
* Utiliser Elysia.group() pour organiser les routes par module ou domaine.
* Utiliser Elysia.onError() pour centraliser la gestion d'erreurs.
* Utiliser TypeBox pour la validation des requêtes (jamais Zod avec ElysiaJS).

Full standard is available here for further request: [ElysiaJS + Bun Development Standards](../../.packmind/standards/elysiajs-bun-development-standards.md)