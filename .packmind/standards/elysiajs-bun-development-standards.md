# ElysiaJS + Bun Development Standards

Ce standard définit les pratiques essentielles pour développer des APIs performantes et type-safe avec ElysiaJS et Bun. Il couvre la validation native TypeBox (pas Zod), l'injection de dépendances, l'organisation des routes, l'optimisation du runtime Bun, et la gestion d'erreurs centralisée. À appliquer sur tous les projets backend utilisant ElysiaJS comme framework HTTP.

## Rules

* Utiliser TypeBox pour la validation des requêtes (jamais Zod avec ElysiaJS).
* Définir les schemas TypeBox inline dans les routes pour validation automatique.
* Activer strict mode dans ElysiaJS pour validation stricte des types.
* Utiliser Elysia.onError() pour centraliser la gestion d'erreurs.
* Préférer Constructor Injection dans les routes avec Factory Pattern.
* Créer des routes avec Factory Functions pour faciliter l'injection de dépendances.
* Utiliser Elysia.group() pour organiser les routes par module ou domaine.
* Activer CORS avec @elysiajs/cors et configurer les origines autorisées explicitement.
* Utiliser bun build avec --target=bun pour optimiser les bundles pour le runtime Bun.
* Démarrer les applications avec bun run (pas node) pour bénéficier des optimisations du runtime natif.
* Configurer tsconfig.json avec "types": ["bun-types"] pour obtenir les types Bun.
* Utiliser Bun.env au lieu de process.env pour accès optimisé aux variables d'environnement.
