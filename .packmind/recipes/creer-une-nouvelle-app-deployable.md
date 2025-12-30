Recipe pour cr\u00e9er une nouvelle application d\u00e9ployable (API, frontend, worker) avec Dockerfile, Railway config et int\u00e9gration monorepo NX."}, {"name": "Ajouter scripts package.json", "description": "Ajouter scripts dans `apps/<nom>/package.json` : `dev`, `build`, `start`, `test` avec commandes Bun appropri\u00e9es."}, {"name": "Configurer CORS si API", "description": "Si app backend, installer @elysiajs/cors et configurer origins autoris\u00e9es dans index.ts."}, {"name": "Ajouter tests e2e", "description": "Cr\u00e9er `apps/<nom>/src/index.test.ts` avec tests end-to-end pour routes principales ou pages critiques."}, {"name": "Configurer CI/CD", "description": "V\u00e9rifier que railway.json watchPatterns inclut tous les dossiers pertinents pour trigger rebuild automatique."}]

## When to Use

- Déployer un nouveau service backend (admin-api, webhooks-api)
- Créer un frontend supplémentaire (mobile-app, admin-dashboard)
- Isoler un worker ou cron job avec runtime séparé
- Ajouter une app avec dépendances externes spécifiques

## Context Validation Checkpoints

* [ ] L'app a-t-elle un point d'entrée distinct (port différent, runtime séparé) ?
* [ ] L'app nécessite-t-elle un déploiement indépendant sur Railway ou autre plateforme ?
* [ ] L'app partage-t-elle du code avec d'autres apps (utiliser libs/shared ou libs/backend) ?
* [ ] L'app a-t-elle besoin de variables d'environnement spécifiques (.env.example) ?
* [ ] L'app doit-elle accéder à PostgreSQL, Redis ou autres services externes ?

## Recipe Steps

### Step 1: Créer la structure

Créer `apps/<nom>/{src,Dockerfile,project.json,railway.json,.env.example,README.md}`. Ajouter .gitignore pour .env si nécessaire.

### Step 2: Configurer project.json

Créer `apps/<nom>/project.json` avec name, sourceRoot, targets (serve, build, lint), tags (`scope:app`, `type:<backend|frontend>`), et implicitDependencies si utilise libs.

### Step 3: Créer le Dockerfile

Créer `apps/<nom>/Dockerfile` avec multi-stage (dependencies, build, production). Utiliser oven/bun:alpine, copier package.json+lockfile, install --frozen-lockfile, COPY code, EXPOSE port, CMD exec form.

### Step 4: Créer railway.json

Créer `apps/<nom>/railway.json` avec builder DOCKERFILE, dockerfilePath, watchPatterns (apps/<nom>/**, libs/**), healthcheckPath, restartPolicyType ON_FAILURE.

### Step 5: Définir .env.example

Créer `apps/<nom>/.env.example` listant toutes les variables requises avec commentaires explicatifs et sources (ex: IGDB_CLIENT_ID # https://dev.twitch.tv).

### Step 6: Créer le point d'entrée

Créer `apps/<nom>/index.ts` comme Composition Root. Lire process.env une fois au startup, créer config objects, instancier Factories, wirer routes Elysia ou setup Nuxt/Astro.

### Step 7: Documenter dans README.md

Créer `apps/<nom>/README.md` avec sections : Description, Configuration (variables env), Démarrage (local), Architecture (stack technique), Déploiement (Railway).

### Step 8: Ajouter au docker-compose.yml

Ajouter service dans `docker-compose.yml` avec image build context, dépendances (postgres, redis), environment variables, ports, restart policy.

### Step 9: Configurer tsconfig

Créer `apps/<nom>/tsconfig.json` qui extend ../../tsconfig.base.json. Définir compilerOptions.outDir si build nécessaire. Inclure src/** dans include.

### Step 10: Wirer les modules

Importer modules depuis `libs/backend/*` ou `libs/shared/*` via Factory Pattern. Utiliser paths aliases définis dans tsconfig.base.json (@metacult/backend-catalog).

### Step 11: Tester localement

Exécuter `bun run apps/<nom>/index.ts` pour tester localement. Vérifier healthcheck endpoint, connexion DB/Redis, chargement config.

### Step 12: Déployer sur Railway

Créer service Railway, configurer variables env depuis Dashboard, déployer, activer healthcheck monitoring, vérifier logs de démarrage.
