# 🔧 Actions Correctives - Audit Technique 2025

**Date:** 30 décembre 2025  
**Statut:** En cours  
**Priorité:** CRITIQUE → IMPORTANT → MOYEN

---

## 🎯 MODE D'EMPLOI POUR L'AGENT

Pour chaque action :
1. ✅ **Implémenter** la correction
2. 🧪 **Vérifier** avec le critère de validation
3. ✅ **Cocher** la checkbox une fois terminé
4. 📝 **Commit** avec le message indiqué

---

## ❌ ACTIONS CRITIQUES

### [ ] Action 1: Refactoriser l'Injection de Dépendances (ElysiaJS)

**Problème:**  
Service Locator pattern utilisé dans `libs/backend/catalog/src/infrastructure/di.ts` et routes qui importent directement `mediaController`.

**Objectif:**  
Passer à Constructor Injection pour découpler les routes et faciliter les tests.

**Fichiers à modifier:**
- `libs/backend/catalog/src/api/routes.ts`
- `libs/backend/discovery/src/api/routes.ts`
- `apps/api/index.ts`

**Corrections:**

```typescript
// 1. libs/backend/catalog/src/api/routes.ts
// REMPLACER tout le fichier par:

import { Elysia, t } from 'elysia';
import type { MediaController } from './http/controllers/media.controller';

const MediaTypeEnum = t.Union([
    t.Literal('game'),
    t.Literal('movie'),
    t.Literal('tv'),
    t.Literal('book'),
]);

// ✅ Factory Pattern: Routes acceptent le controller en paramètre
export const createCatalogRoutes = (controller: MediaController) => {
    return new Elysia({ prefix: '/media' })
        .onError(({ code, error, set }) => {
            if (code === 'VALIDATION') {
                set.status = 400;
                return { message: 'Validation Error', details: error };
            }
        })
        .get('/search', ({ query }) => {
            return controller.search(query);
        }, {
            query: t.Object({
                q: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
                type: t.Optional(MediaTypeEnum),
                tag: t.Optional(t.String({ pattern: '^[a-z0-9-]+$' })),
            })
        })
        .post('/import', ({ body }) => {
            return controller.import(body);
        }, {
            body: t.Object({
                mediaId: t.String({ minLength: 1 }),
                type: MediaTypeEnum,
            })
        });
};
```

```typescript
// 2. libs/backend/catalog/src/index.ts
// AJOUTER à la fin du fichier:

// ===== API (Elysia Routes Factory) =====
export * from './api/routes'; // Exporte createCatalogRoutes
export { MediaController } from './api/http/controllers/media.controller';
```

```typescript
// 3. libs/backend/discovery/src/api/routes.ts
// REMPLACER tout le fichier par:

import { Elysia, t } from 'elysia';
import type { FeedController } from './http/controllers/feed.controller';

export const createDiscoveryRoutes = (controller: FeedController) => {
    return new Elysia({ prefix: '/discovery' })
        .get('/feed', ({ query }) => controller.getFeed(query), {
            query: t.Object({
                q: t.Optional(t.String({ maxLength: 100 }))
            })
        });
};
```

```typescript
// 4. apps/api/index.ts
// REMPLACER la section "--- COMPOSITION ROOT ---" par:

// --- COMPOSITION ROOT (Dependency Injection Manual) ---

// 1. Catalog Module
const mediaRepo = new DrizzleMediaRepository(db as any);
const searchHandler = new SearchMediaHandler(mediaRepo);
const importHandler = new ImportMediaHandler(
    mediaRepo,
    new IgdbProvider(process.env.IGDB_CLIENT_ID || '', process.env.IGDB_CLIENT_SECRET || ''),
    new TmdbProvider(process.env.TMDB_API_KEY || ''),
    new GoogleBooksProvider(process.env.GOOGLE_BOOKS_API_KEY || '')
);
const catalogController = new MediaController(searchHandler, importHandler);

// 2. Marketing Module
const adsHandler = new GetActiveAdsHandler(redisClient);

// 3. Discovery Module
const mediaSearchAdapter = {
  search: async (q: string) => searchHandler.execute({ search: q })
};
const adsAdapter = {
  getAds: async () => adsHandler.execute(new GetActiveAdsQuery())
};
const mixedFeedHandler = new GetMixedFeedHandler(redisClient, mediaSearchAdapter, adsAdapter);
const discoveryController = new FeedController(mixedFeedHandler);

// ✅ Injection des controllers dans les routes
const catalogRoutes = createCatalogRoutes(catalogController);
const discoveryRoutes = createDiscoveryRoutes(discoveryController);
```

```typescript
// 5. SUPPRIMER le fichier libs/backend/catalog/src/infrastructure/di.ts
// Ce fichier ne doit plus exister (Service Locator anti-pattern)
```

**Validation:**
```bash
# Vérifier que le lint passe
bunx nx run backend-catalog:lint

# Vérifier que les tests passent
bun test libs/backend/catalog

# Vérifier que l'API démarre sans erreur
bun run apps/api/index.ts
```

**Commit:**
```bash
git add .
git commit -m "refactor(catalog): replace Service Locator with Constructor Injection in routes"
```

---

### [ ] Action 2: Compléter l'Encapsulation du Module Catalog

**Problème:**  
`index.ts` expose encore les implémentations. La Factory existe mais n'est pas utilisée partout.

**Objectif:**  
Masquer toutes les implémentations infrastructure, exposer uniquement Factory et contrats.

**Fichiers à modifier:**
- `libs/backend/catalog/src/index.ts` (déjà partiellement corrigé)

**Corrections:**

```typescript
// libs/backend/catalog/src/index.ts
// Vérifier que le fichier contient UNIQUEMENT:

// ===== DOMAIN (Public API) =====
export * from './domain/entities/media.entity';
export * from './domain/value-objects/rating.vo';
export * from './domain/value-objects/cover-url.vo';
export * from './domain/value-objects/release-year.vo';

// ===== APPLICATION (Public API) =====
export * from './application/queries/search-media/search-media.query';
export * from './application/queries/search-media/search-media.handler';
export * from './application/commands/import-media/import-media.command';
export * from './application/commands/import-media/import-media.handler';
export * from './application/factories/catalog.factory'; // ✅ Preferred way

// ===== APPLICATION PORTS (Interfaces) =====
export * from './application/ports/media.repository.interface';
export * from './application/ports/media-provider.interface';

// ===== API (Elysia Routes) =====
export * from './api/routes'; // createCatalogRoutes
export { MediaController } from './api/http/controllers/media.controller';

// ===== INFRASTRUCTURE (Limited Exports) =====
// ⚠️ Schema exported for DB initialization only (composition root)
export * as mediaSchema from './infrastructure/db/media.schema';

// ✅ AUCUN export de DrizzleMediaRepository, IgdbProvider, etc.
```

**Validation:**
```bash
# Vérifier qu'aucune implémentation n'est exportée
grep -r "export.*DrizzleMediaRepository\|export.*IgdbProvider" libs/backend/catalog/src/index.ts
# Doit retourner: aucun résultat

# Vérifier que le module compile
bunx nx build backend-catalog || echo "Build target may not exist, skip"
```

**Commit:**
```bash
git commit -am "refactor(catalog): hide infrastructure implementations from public API"
```

---

## ⚠️ ACTIONS IMPORTANTES

### [ ] Action 3: Auto-héberger les Google Fonts (Astro)

**Problème:**  
Fonts chargées depuis CDN Google (requêtes DNS additionnelles, RGPD).

**Objectif:**  
Utiliser `@fontsource` pour auto-hébergement.

**Fichiers à modifier:**
- `apps/website/package.json`
- `apps/website/src/layouts/Layout.astro`

**Corrections:**

```bash
# 1. Installer @fontsource
cd apps/website
bun add @fontsource/roboto
```

```astro
<!-- 2. apps/website/src/layouts/Layout.astro -->
<!-- REMPLACER les imports dans la section --- (frontmatter) -->

---
import { Header, Footer } from '@metacult/shared-ui';
import '@metacult/shared-ui/styles/global.css';

// ✅ Auto-hébergement des fonts
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

interface Props {
    title: string;
    bodyClass?: string;
}

const { title, bodyClass = '' } = Astro.props;
---
```

```astro
<!-- 3. Dans le <head>, SUPPRIMER les lignes: -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
    href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
    rel="stylesheet"
/>
```

**Validation:**
```bash
# Vérifier qu'aucun lien Google Fonts n'existe
grep -r "fonts.googleapis.com" apps/website/src/
# Doit retourner: aucun résultat

# Vérifier que le build fonctionne
bunx nx build website

# Vérifier que les fonts sont bien bundlées
ls apps/website/dist/_astro/*.woff2
```

**Commit:**
```bash
git commit -am "perf(website): self-host Google Fonts with @fontsource"
```

---

### [ ] Action 4: Ajouter fetchpriority sur l'image LCP (Astro)

**Problème:**  
Image Hero sans priorisation explicite (retarde le LCP).

**Objectif:**  
Ajouter `fetchpriority="high"` sur l'image LCP.

**Fichiers à modifier:**
- `apps/website/src/pages/index.astro`

**Corrections:**

```astro
<!-- apps/website/src/pages/index.astro -->
<!-- MODIFIER le composant Hero pour ajouter fetchpriority -->

<Hero
    client:idle
    badge="Nouvelle Version 2.0"
    heading="Le Radar Social pour votre Culture."
    description="Découvrez, suivez et partagez vos films, jeux et séries préférés avec votre squad. Une seule app pour toute votre culture."
    ctaText="Créez votre compte"
    ctaLink="/auth/register"
    secondaryCtaText="Connectez-vous"
    secondaryCtaLink="/auth/login"
    image={heroBg.src}
    imageSizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
    fetchpriority="high"
/>
```

```vue
<!-- Si le composant Hero n'accepte pas fetchpriority, modifier: -->
<!-- libs/shared/ui/src/components/hero/Hero.vue -->

<script setup lang="ts">
// AJOUTER fetchpriority aux props
defineProps<{
  // ... autres props
  fetchpriority?: 'high' | 'low' | 'auto';
}>();
</script>

<template>
  <img 
    :src="image" 
    :fetchpriority="fetchpriority || 'auto'"
    <!-- ... autres attributs -->
  />
</template>
```

**Validation:**
```bash
# Vérifier que fetchpriority est présent dans le HTML généré
bunx nx build website
grep -r "fetchpriority" apps/website/dist/index.html
# Doit contenir: fetchpriority="high"

# Tester le LCP avec Lighthouse
# Le score LCP doit s'améliorer (<2.5s)
```

**Commit:**
```bash
git commit -am "perf(website): add fetchpriority=high to hero image for better LCP"
```

---

## 📦 ACTIONS MOYENNES

### [ ] Action 5: Optimiser Docker Cache Layers

**Problème:**  
`COPY . .` avant `bun install` invalide le cache à chaque changement de code.

**Objectif:**  
Copier les fichiers de dépendances d'abord, puis le code source.

**Fichiers à modifier:**
- `apps/api/Dockerfile`
- `.dockerignore` (à créer)

**Corrections:**

```dockerfile
# apps/api/Dockerfile
# REMPLACER tout le contenu par:

FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

# Install dependencies (using cache)
FROM base AS install
# ✅ Copy package files FIRST (cache layer)
COPY package.json bun.lock ./
COPY apps/api/package.json ./apps/api/package.json
RUN bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY --from=install /usr/src/app/node_modules ./node_modules
# ✅ Copy source code AFTER dependencies
COPY . .

# Run Tests during build
RUN bun test apps/api

# Final image
FROM base AS release
COPY --from=install /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app .

COPY apps/api/start.sh ./apps/api/start.sh
RUN chmod +x ./apps/api/start.sh

USER bun
ENV PORT=3000
EXPOSE 3000/tcp
ENTRYPOINT []
CMD ["/apps/api/start.sh"]
```

```
# .dockerignore (nouveau fichier à la racine)
node_modules
.git
.nx
dist
.output
.nuxt
.astro
*.log
.env.local
.env*.local
coverage
.vscode
.idea
```

**Validation:**
```bash
# Vérifier que le build fonctionne
docker build -f apps/api/Dockerfile -t metacult-api .

# Modifier un fichier source et rebuild
# Le layer "bun install" doit être en cache (CACHED)
echo "// test" >> apps/api/index.ts
docker build -f apps/api/Dockerfile -t metacult-api .
# Doit afficher: "CACHED" pour le RUN bun install

# Nettoyer
git checkout apps/api/index.ts
```

**Commit:**
```bash
git add apps/api/Dockerfile .dockerignore
git commit -m "perf(docker): optimize cache layers and add .dockerignore"
```

---

### [ ] Action 6: Ajouter .dockerignore pour les autres apps

**Objectif:**  
Appliquer le même pattern aux autres Dockerfiles.

**Fichiers à modifier:**
- `apps/webapp/Dockerfile`
- `apps/website/Dockerfile`
- `apps/worker/Dockerfile`

**Corrections:**

Appliquer le même principe que l'Action 5 :
1. `COPY package.json bun.lock` AVANT `RUN bun install`
2. `COPY . .` APRÈS installation
3. Le `.dockerignore` à la racine s'applique à tous

**Validation:**
```bash
# Vérifier chaque build
docker build -f apps/webapp/Dockerfile -t metacult-webapp .
docker build -f apps/website/Dockerfile -t metacult-website .
docker build -f apps/worker/Dockerfile -t metacult-worker .
```

**Commit:**
```bash
git commit -am "perf(docker): optimize all Dockerfiles with proper cache layers"
```

---

## ✅ VALIDATION FINALE

### [ ] Checklist Globale

- [ ] Tous les lints passent : `bunx nx run-many -t lint`
- [ ] Tous les tests passent : `bun test`
- [ ] L'API démarre sans erreur : `bun run apps/api/index.ts`
- [ ] Le site Astro build sans erreur : `bunx nx build website`
- [ ] L'app Nuxt build sans erreur : `bunx nx build webapp`
- [ ] Les Docker builds fonctionnent : `docker-compose build`
- [ ] Aucun import d'infrastructure dans `/domain/**/*.ts`
- [ ] Les routes Elysia utilisent Constructor Injection
- [ ] Les fonts sont auto-hébergées (pas de requêtes Google Fonts)
- [ ] fetchpriority="high" présent sur image Hero
- [ ] .dockerignore contient node_modules, .git, dist

### Commande de vérification complète

```bash
# Linting
bunx nx run-many -t lint --skip-nx-cache

# Tests
bun test

# Builds
bunx nx run-many -t build --skip-nx-cache

# Docker (optionnel)
docker-compose build
```

---

## 📊 MÉTRIQUES DE SUCCÈS

- **Injection de Dépendances** : Aucun export global de controller/service
- **Encapsulation** : Aucune implémentation exportée dans `index.ts` sauf schema
- **Performance Fonts** : 0 requête vers fonts.googleapis.com
- **LCP** : Score Lighthouse > 90 (ou amélioration de 10+ points)
- **Docker Build** : Temps de rebuild < 30s (avec cache)

---

## 🚀 ORDRE D'EXÉCUTION RECOMMANDÉ

1. Action 2 (Encapsulation) - Prérequis pour Action 1
2. Action 1 (Injection) - CRITIQUE
3. Action 3 (Fonts)
4. Action 4 (fetchpriority)
5. Action 5 (Docker)
6. Action 6 (Docker suite)
7. Validation Finale

---

**Notes:**
- Chaque action est indépendante (sauf Action 1 dépend de Action 2)
- Tester après chaque action avant de passer à la suivante
- En cas d'erreur, rollback avec `git checkout -- <fichier>`
