# Packmind Recipes Index

This recipes index contains all available coding recipes that can be used by AI agents (like Cursor, Claude Code, GitHub Copilot) to find and use proven patterns in coding tasks.

## Available Recipes

- [Créer un Bounded Context DDD](recipes/creer-un-bounded-context-ddd.md) : Recipe pour créer un nouveau Bounded Context backend respectant DDD et Clean Architecture avec structure complète (domain, application, infrastructure, api)."}, {"name": "Ajouter tsconfig paths", "description": "Ajouter alias dans `tsconfig.base.json` paths : `@metacult/backend-<nom>`: [`libs/backend/<nom>/src/index.ts`]"}, {"name": "Créer les tests", "description": "Créer fichiers `.spec.ts` adjacents aux handlers et services avec tests unitaires. Mocker les repositories et providers."}, {"name": "Générer migration Drizzle", "description": "Exécuter `bun db:generate` pour générer migration SQL depuis schema. Vérifier fichier dans `libs/backend/infrastructure/drizzle/`."}, {"name": "Documenter dans AGENTS.md", "description": "Ajouter section dans AGENTS.md décrivant le nouveau Bounded Context, son rôle, ses dépendances et son API publique."}]
- [Créer une nouvelle App déployable](recipes/creer-une-nouvelle-app-deployable.md) : Recipe pour cr\u00e9er une nouvelle application d\u00e9ployable (API, frontend, worker) avec Dockerfile, Railway config et int\u00e9gration monorepo NX."}, {"name": "Ajouter scripts package.json", "description": "Ajouter scripts dans `apps/<nom>/package.json` : `dev`, `build`, `start`, `test` avec commandes Bun appropri\u00e9es."}, {"name": "Configurer CORS si API", "description": "Si app backend, installer @elysiajs/cors et configurer origins autoris\u00e9es dans index.ts."}, {"name": "Ajouter tests e2e", "description": "Cr\u00e9er `apps/<nom>/src/index.test.ts` avec tests end-to-end pour routes principales ou pages critiques."}, {"name": "Configurer CI/CD", "description": "V\u00e9rifier que railway.json watchPatterns inclut tous les dossiers pertinents pour trigger rebuild automatique."}]


---

*This recipes index was automatically generated from deployed recipe versions.*