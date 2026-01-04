---
applyTo: '**'
---

## Standard: Docker Multi-Stage Builds Bun

Pratiques Docker avec Bun pour monorepo NX : single-stage (runtime direct) et multi-stage (apps buildées). :

- Utiliser oven/bun:1-alpine comme image de base (Alpine pour légèreté).
- Copier package.json et bun.lock (pas bun.lockb) AVANT le code pour optimiser le cache Docker.
- Copier TOUS les package.json du monorepo (apps/_/package.json, libs/_/package.json) pour que bun install fonctionne avec workspaces.
- Installer avec bun install --frozen-lockfile --production pour apps runtime direct (API, Worker).
- Installer avec bun install --frozen-lockfile (toutes dépendances) pour apps nécessitant un build (Nuxt, Astro).
- Pour apps multi-stage (Nuxt) : Séparer en 2 stages builder (build avec toutes deps) et runner (copie artefacts buildés).
- Pour apps single-stage (API, Worker) : Un seul stage runner avec install production puis copie du code source.
- Copier nx.json et tsconfig.base.json dans TOUS les Dockerfiles (requis pour résolution des paths aliases monorepo).
- Utiliser CMD avec forme exec ["bun", "chemin/vers/fichier"] (jamais shell form).
- Définir NODE_ENV=production dans tous les Dockerfiles.
- Utiliser .dockerignore pour exclure node_modules, .nx, .git, dist, .output du contexte de build.
- Passer les variables d'environnement via Railway Dashboard ou docker-compose.yml (jamais COPY .env).

Full standard is available here for further request: [Docker Multi-Stage Builds Bun](../../.packmind/standards/docker-multi-stage-builds-bun.md)
