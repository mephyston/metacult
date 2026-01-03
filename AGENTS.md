<!-- start: Packmind standards -->
# Packmind Standards

Before starting your work, make sure to review the coding standards relevant to your current task.

Always consult the sections that apply to the technology, framework, or type of contribution you are working on.

All rules and guidelines defined in these standards are mandatory and must be followed consistently.

Failure to follow these standards may lead to inconsistencies, errors, or rework. Treat them as the source of truth for how code should be written, structured, and maintained.

## Standard: AstroJS Development Standards

Regroupe les pratiques essentielles pour un projet AstroJS moderne et robuste. :
* Adopter l’Islands Architecture : rendu serveur par défaut, hydratation sélective.
* Gérer le SEO avec les balises meta, Open Graph, et JSON-LD.
* Optimiser les images avec le composant <Image /> et formats modernes.
* Organiser le contenu avec Content Collections et Content Layer API.
* Préférer le rendu statique (SSG) et n’activer SSR que si nécessaire.
* Structurer le projet par fonctionnalité ou type de contenu.
* Utiliser le composant <ClientRouter /> pour les transitions de vue SPA-like.
* Utiliser les composants .astro pour le contenu statique, importer des composants framework seulement pour l’interactivité.
* Utiliser les directives client (`client:load`, `client:idle`, etc.) uniquement si nécessaire.
* Utiliser TypeScript et générer les types avec `astro sync`.

Full standard is available here for further request: [AstroJS Development Standards](.packmind/standards/astrojs-development-standards.md)

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

Full standard is available here for further request: [DDD Clean Architecture Implementation](.packmind/standards/ddd-clean-architecture-implementation.md)

## Standard: Docker Multi-Stage Builds Bun

Pratiques Docker multi-stage avec Bun pour images optimis\u00e9es, cache intelligent et s\u00e9curit\u00e9. :
* Configurer HEALTHCHECK avec curl ou wget pour monitoring automatique.
* Copier package.json et bun.lockb AVANT le code pour cache layer des dépendances.
* Définir un USER non-root pour sécurité (USER bun en production).
* Exposer le port avec EXPOSE 3000 (documentatif pour Railway/docker-compose).
* Installer les dépendances avec bun install --frozen-lockfile en stage dependencies.
* Optimiser la taille finale avec apk del après installation si packages temporaires nécessaires.
* Passer les variables d'environnement via docker-compose.yml ou Railway (pas COPY .env).
* Séparer les stages en dependencies, build, production pour optimiser le cache.
* Utiliser .dockerignore pour exclure node_modules, .nx, .git du contexte de build.
* Utiliser CMD avec forme exec ["bun", "run", "start"] comme entrypoint (pas shell form).
* Utiliser COPY --from=dependencies pour réutiliser node_modules entre stages.
* Utiliser oven/bun:alpine comme image de base (plus légère que debian).

Full standard is available here for further request: [Docker Multi-Stage Builds Bun](.packmind/standards/docker-multi-stage-builds-bun.md)

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

Full standard is available here for further request: [ElysiaJS + Bun Development Standards](.packmind/standards/elysiajs-bun-development-standards.md)

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

Full standard is available here for further request: [NX Monorepo Architecture Standards](.packmind/standards/nx-monorepo-architecture-standards.md)

## Standard: Railway Deployment Standards

Pratiques de déploiement sur Railway avec configuration optimale et healthchecks. :
* Activer le build cache Docker avec multi-stage builds.
* Configurer startCommand avec le binaire et chemin corrects (bun, node).
* Configurer watchPatterns pour rebuild uniquement si fichiers pertinents modifiés.
* Créer un railway.json par application déployable avec configuration spécifique.
* Définir un healthcheckPath pour vérifier le démarrage de l'application.
* Documenter les variables d'environnement requises dans README.md par app.
* Injecter les variables d'environnement via Railway Dashboard (jamais .env en production).
* Utiliser builder DOCKERFILE et spécifier dockerfilePath relatif à la racine.
* Utiliser restartPolicyType ON_FAILURE pour auto-restart en cas d'erreur.

Full standard is available here for further request: [Railway Deployment Standards](.packmind/standards/railway-deployment-standards.md)

## Standard: VueJS 3 Development Standards

Standard global pour le développement Vue.js 3 avec Composition API et TypeScript. :
* Adhere to the single responsibility principle: keep components small and focused on one concern.
* Avoid using v-html to prevent Cross-Site Scripting (XSS); sanitize inputs if HTML rendering is necessary.
* Enable strict mode in tsconfig.json and use TypeScript with <script setup lang="ts"> for maximum type safety.
* Extract reusable logic into composable functions in a composables/ directory.
* Favor the Composition API (setup functions and composables) over the Options API for better logic organization and reuse.
* Handle loading, error, and success states explicitly when fetching data.
* Lazy-load components with dynamic imports and defineAsyncComponent to optimize initial bundle size.
* Use <style scoped> or CSS Modules to prevent style leakage between components.
* Use PascalCase for component names and kebab-case for file names (e.g., MyComponent.vue).
* Use Pinia for global state management and ref/reactive for local state within components.
* Use semantic HTML elements and ARIA attributes to ensure WCAG compliance.

Full standard is available here for further request: [VueJS 3 Development Standards](.packmind/standards/vuejs-3-development-standards.md)

## Standard: Web Performance - Cache HTTP

Appliquer sur tous les assets statiques (JS, CSS, images, fonts) et contenus dynamiques pour minimiser les requêtes réseau. :
* Configurer le bfcache (back/forward cache) en évitant les événements unload et en utilisant pagehide/pageshow
* Configurer les en-têtes Vary pour gérer correctement le cache selon Accept-Encoding et autres critères
* Configurer un CDN avec cache géographique et purge automatique lors des déploiements
* Implémenter un Service Worker avec stratégie de cache (Network First, Cache First, Stale While Revalidate) selon le type de ressource
* Précharger les ressources critiques avec <link rel="preload"> et les mettre en cache immédiatement
* Utiliser Cache-Control: no-cache pour le HTML (permet revalidation avec ETag) et éviter no-store sauf données sensibles
* Utiliser Cache-Control: public, max-age=31536000, immutable pour les assets versionnés (avec hash dans le nom de fichier)
* Utiliser must-revalidate pour les contenus sensibles qui ne doivent jamais être servis obsolètes
* Utiliser stale-while-revalidate pour servir le cache pendant la mise à jour en arrière-plan
* Versionner les assets (hash dans le nom) pour permettre un cache agressif sans risque de fichiers obsolètes

Full standard is available here for further request: [Web Performance - Cache HTTP](.packmind/standards/web-performance-cache-http.md)

## Standard: Web Performance - Chargement JavaScript

Appliquer lors de l'int\u00e9gration de scripts tiers, du d\u00e9veloppement de SPA, et pour tout JavaScript non-critique. :
* Activer le tree-shaking en utilisant des imports nommés et en évitant les imports par défaut de grosses librairies
* Éliminer le JavaScript mort avec des outils d'analyse de coverage (Chrome DevTools Coverage)
* Implémenter le code splitting pour charger uniquement le JavaScript nécessaire à chaque page
* Lazy-load les composants non visibles initialement avec Intersection Observer
* Précharger les modules dynamiques avec <link rel="modulepreload"> pour réduire la latence
* Utiliser async uniquement pour les scripts indépendants (analytics, publicités) qui n'ont pas de dépendances
* Utiliser defer pour les scripts non-critiques afin de ne pas bloquer le parsing HTML
* Utiliser requestIdleCallback pour exécuter le JavaScript non-critique pendant les périodes d'inactivité
* Utiliser type="module" avec import maps pour charger les modules ES6 natifs et réduire le bundle
* Utiliser Web Workers pour déléguer les calculs lourds hors du thread principal

Full standard is available here for further request: [Web Performance - Chargement JavaScript](.packmind/standards/web-performance-chargement-javascript.md)

## Standard: Web Performance - Gestion des Scripts Tiers

Appliquer lors de l'int\u00e9gration de tout service tiers (analytics, publicit\u00e9s, chatbots, widgets sociaux, A/B testing). :
* Charger les scripts tiers après l'événement load ou lors de l'interaction utilisateur pour préserver le TTI
* Charger tous les scripts tiers en asynchrone (async ou defer) pour éviter le blocage du rendu
* Configurer des Resource Hints (prefetch, dns-prefetch) uniquement pour les domaines tiers réellement utilisés
* Implémenter le Google Consent Mode v2 pour différer le chargement des scripts analytics/ads selon le consentement RGPD
* Implémenter un timeout sur les scripts tiers pour éviter les blocages si le service est indisponible
* Limiter le nombre de scripts tiers à maximum 3-5 essentiels et évaluer le ROI de chacun
* Monitorer l'impact des scripts tiers avec Request Blocking dans Chrome DevTools et mesurer le gain
* Utiliser des facades (façades) pour les widgets lourds (YouTube, Google Maps, chatbots) et charger le vrai widget au clic
* Utiliser dns-prefetch et preconnect pour réduire la latence des domaines tiers
* Utiliser Partytown pour exécuter les scripts tiers dans un Web Worker et libérer le thread principal

Full standard is available here for further request: [Web Performance - Gestion des Scripts Tiers](.packmind/standards/web-performance-gestion-des-scripts-tiers.md)

## Standard: Web Performance - Optimisation des Fonts

Appliquer sur tous les projets utilisant des polices Web custom, particulièrement si plusieurs poids ou variantes sont n\u00e9cessaires. :
* Auto-héberger les Google Fonts au lieu d'utiliser le CDN Google pour réduire les requêtes DNS
* Définir une font-stack de fallback similaire à la police custom pour réduire le CLS
* Limiter le nombre de poids et variantes de police (maximum 2-3 poids par police)
* Monitorer le chargement des polices avec document.fonts.ready pour déclencher des animations après le swap
* Précharger les polices critiques avec <link rel="preload"> et attribut crossorigin
* Utiliser font-display: swap pour afficher le texte immédiatement avec une police de fallback
* Utiliser le subsetting pour ne charger que les caractères utilisés (latin-ext, glyphes spécifiques)
* Utiliser les variable fonts pour remplacer plusieurs poids par un seul fichier
* Utiliser unicode-range pour charger uniquement les subsets nécessaires selon la langue
* Utiliser WOFF2 comme format unique (support universel depuis 2016, meilleur taux de compression)

Full standard is available here for further request: [Web Performance - Optimisation des Fonts](.packmind/standards/web-performance-optimisation-des-fonts.md)

## Standard: Web Performance - Optimisation des Images

Appliquer sur toutes les images du site, particulièrement les hero images, galeries photos et contenus riches en visuels. :
* Ajouter loading="lazy" sur toutes les images non-critiques (pas dans le viewport initial)
* Compresser toutes les images avec des outils comme sharp, imagemin, ou squoosh à un niveau de qualité 85-90
* Implémenter un placeholder LQIP (Low Quality Image Placeholder) ou blur-hash pour améliorer la perception du chargement
* Limiter la résolution maximale à 2x (Retina) et ne pas servir 3x ou 4x qui sont imperceptibles
* Optimiser les SVG avec SVGO pour supprimer les métadonnées et simplifier les paths
* Spécifier width et height sur toutes les images pour éviter le CLS
* Utiliser fetchpriority="high" sur l'image LCP (souvent le hero) pour accélérer son chargement
* Utiliser le format SVG pour les logos, icônes et illustrations simples au lieu de PNG/JPEG
* Utiliser les formats modernes WebP et AVIF avec fallback JPEG/PNG pour réduire le poids de 30-50%
* Utiliser srcset et sizes pour servir des images adaptées à la résolution de l'écran

Full standard is available here for further request: [Web Performance - Optimisation des Images](.packmind/standards/web-performance-optimisation-des-images.md)

## Standard: Web Performance - Seuils et Métriques

Appliquer sur tous les projets Web, particulièrement en phase de développement, dans les pipelines CI/CD, et lors des audits de performance. :
* Ajouter la balise meta viewport pour éviter les INP élevés sur mobile (souvent oubliée)
* Ajouter le header Timing-Allow-Origin sur les images cross-origin pour mesurer le LCP correctement
* Définir des objectifs chiffrés par métrique et les documenter dans les spécifications du projet
* Implémenter des Custom Metrics avec performance.mark() et performance.measure() pour mesurer les événements métier critiques
* Le contenu à indexer DOIT être dans le HTML serveur (pas uniquement généré par JavaScript) et respecter le principe 1 URL = 1 page pour le SEO
* Limiter le CSS total à 68 Ko sur mobile en chargeant les styles critiques inline et en différant le CSS non-critique
* Limiter le JavaScript total à 465 Ko sur mobile (médiane HTTPArchive 2021) et configurer des alertes CI/CD si les seuils sont dépassés
* Limiter les fonts à 108 Ko en utilisant le subsetting (seulement les caractères nécessaires) et font-display: swap
* Limiter les images totales à 870 Ko sur mobile en utilisant des formats modernes (WebP, AVIF) et le lazy-loading
* Mesurer l'INP (Interaction to Next Paint) et viser moins de 200ms pour 75% des utilisateurs en optimisant les callbacks d'événements
* Mesurer le CLS (Cumulative Layout Shift) et viser moins de 0,1 pour 75% des utilisateurs en réservant l'espace pour les contenus dynamiques
* Mesurer le LCP (Largest Contentful Paint) et viser moins de 2,5 secondes pour 75% des utilisateurs en optimisant l'image hero avec preload et fetchpriority
* Mesurer le TTFB (Time To First Byte) et viser moins de 500ms pour 80% des pages en optimisant le serveur et le cache
* Minifier et compresser toutes les ressources avec Gzip ou Brotli côté serveur
* Servir des images responsive avec srcset et sizes adaptées au viewport et limiter le DPR à 2x maximum
* Tester sur matériel milieu de gamme (Motorola G4 ou équivalent ~200€) avec connexion 4G simulée (latence 40-50ms, débit 30-50 Mb/s)
* Utiliser transform pour les animations CSS car ignoré par le calcul CLS, et éviter les animations sur width, height, top, left

Full standard is available here for further request: [Web Performance - Seuils et Métriques](.packmind/standards/web-performance-seuils-et-metriques.md)
<!-- end: Packmind standards -->
<!-- start: Packmind recipes -->
# Packmind Recipes

🚨 **MANDATORY STEP** 🚨

Before writing, editing, or generating ANY code:

**ALWAYS READ**: the available recipes below to see what recipes are available

## Recipe Usage Rules:
- **MANDATORY**: Always check the recipes list first
- **CONDITIONAL**: Only read/use individual recipes if they are relevant to your task
- **OPTIONAL**: If no recipes are relevant, proceed without using any

**Remember: Always check the recipes list first, but only use recipes that actually apply to your specific task.**`

## Available recipes

* [Créer un Bounded Context DDD](.packmind/recipes/creer-un-bounded-context-ddd.md): Recipe pour créer un nouveau Bounded Context backend respectant DDD et Clean Architecture avec structure complète (domain, application, infrastructure, api)."}, {"name": "Ajouter tsconfig paths", "description": "Ajouter alias dans `tsconfig.base.json` paths : `@metacult/backend-<nom>`: [`libs/backend/<nom>/src/index.ts`]"}, {"name": "Créer les tests", "description": "Créer fichiers `.spec.ts` adjacents aux handlers et services avec tests unitaires. Mocker les repositories et providers."}, {"name": "Générer migration Drizzle", "description": "Exécuter `bun db:generate` pour générer migration SQL depuis schema. Vérifier fichier dans `libs/backend/infrastructure/drizzle/`."}, {"name": "Documenter dans AGENTS.md", "description": "Ajouter section dans AGENTS.md décrivant le nouveau Bounded Context, son rôle, ses dépendances et son API publique."}]
* [Créer une nouvelle App déployable](.packmind/recipes/creer-une-nouvelle-app-deployable.md): Recipe pour cr\u00e9er une nouvelle application d\u00e9ployable (API, frontend, worker) avec Dockerfile, Railway config et int\u00e9gration monorepo NX."}, {"name": "Ajouter scripts package.json", "description": "Ajouter scripts dans `apps/<nom>/package.json` : `dev`, `build`, `start`, `test` avec commandes Bun appropri\u00e9es."}, {"name": "Configurer CORS si API", "description": "Si app backend, installer @elysiajs/cors et configurer origins autoris\u00e9es dans index.ts."}, {"name": "Ajouter tests e2e", "description": "Cr\u00e9er `apps/<nom>/src/index.test.ts` avec tests end-to-end pour routes principales ou pages critiques."}, {"name": "Configurer CI/CD", "description": "V\u00e9rifier que railway.json watchPatterns inclut tous les dossiers pertinents pour trigger rebuild automatique."}]
<!-- end: Packmind recipes -->
---

# 🏗️ Architecture Globale

## Configuration & Environment Variables (2025)

### 📋 Vue d'Ensemble

**Objectif :** Configuration centralisée, type-safe, validée au démarrage avec TypeBox.  
**Principe :** Aucune logique conditionnelle hardcodée (NODE_ENV, hostname, etc.) pour les URLs.  
**Runtime Config :** Injection au lancement Docker (pas de rebuild nécessaire).

### 🔧 Backend - ConfigurationService

**Fichier :** `libs/backend/infrastructure/src/lib/config/configuration.service.ts`

```
┌─────────────────────────────────────────────────────┐
│         ConfigurationService (Singleton)            │
│                                                     │
│  ┌──────────────────────────────────────────┐     │
│  │  TypeBox Schema Validation (Fail-Fast)   │     │
│  │  - DATABASE_URL (uri)                    │     │
│  │  - REDIS_URL (uri)                       │     │
│  │  - JWT_SECRET (min 32 chars)             │     │
│  │  - BETTER_AUTH_SECRET                    │     │
│  │  - BETTER_AUTH_URL (uri)                 │     │
│  │  - GOOGLE_CLIENT_ID                      │     │
│  │  - PUBLIC_API_URL (uri)                  │     │
│  │  - INTERNAL_API_URL (optional)           │     │
│  │  - NODE_ENV (dev|staging|prod)           │     │
│  │  - ... et 15+ autres variables           │     │
│  └──────────────────────────────────────────┘     │
│                                                     │
│  API: configService.get<K>(key: K): EnvType[K]    │
│  Helpers: .isProduction, .isDevelopment, .isStaging│
└─────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐         ┌─────┴─────┐       ┌─────┴─────┐
    │ DB      │         │ Redis     │       │ BetterAuth│
    │ Client  │         │ Client    │       │ Service   │
    └─────────┘         └───────────┘       └───────────┘
```

**Avantages :**
- ✅ Type-Safe : Auto-complétion TypeScript
- ✅ Fail-Fast : Erreur explicite au démarrage si config invalide
- ✅ Single Source of Truth : Un seul endroit pour lire la config
- ✅ Testable : Facile à mocker en tests

**Exemples d'utilisation :**
```typescript
// ❌ AVANT (éparpillé, non validé)
const dbUrl = process.env.DATABASE_URL || 'fallback';

// ✅ APRÈS (centralisé, validé, type-safe)
const dbUrl = configService.get('DATABASE_URL');
```

---

### 🌐 Frontend - Split Horizon URLs

**Concept :** Différencier les URLs selon le contexte d'exécution.

```
┌────────────────────────────────────────────────────┐
│              Split Horizon Architecture            │
└────────────────────────────────────────────────────┘

  Server-Side (SSR/SSG)          Client-Side (Browser)
  ┌──────────────────┐           ┌──────────────────┐
  │ INTERNAL_API_URL │           │ PUBLIC_API_URL   │
  │ (Railway Private)│           │ (Public Internet)│
  └──────────────────┘           └──────────────────┘
         │                               │
         ▼                               ▼
  http://api.railway.internal     https://api.metacult.app
  (Pas de latence DNS/SSL)        (Accessible par users)
```

**Nuxt :**
```typescript
// apps/webapp/app/composables/useApiUrl.ts
export const useApiUrl = () => {
  const config = useRuntimeConfig();
  
  if (import.meta.server) {
    // SSR : Réseau privé Railway
    return config.internalApiUrl || config.public.apiUrl;
  }
  
  // Browser : Réseau public
  return config.public.apiUrl;
};
```

**Astro :**
```typescript
// apps/website/src/utils/get-api-url.ts
export function getApiUrl(): string {
  if (import.meta.env.SSR) {
    return import.meta.env.INTERNAL_API_URL || 
           import.meta.env.PUBLIC_API_URL;
  }
  return import.meta.env.PUBLIC_API_URL;
}
```

---

### 📦 Variables d'Environnement par App

#### Backend API
```bash
# Infrastructure
PORT=3000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...

# Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=https://api.metacult.app
AUTH_COOKIE_PREFIX=metacult
ROOT_DOMAIN=.metacult.app

# OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# URLs
PUBLIC_API_URL=https://api.metacult.app
INTERNAL_API_URL=http://api.railway.internal:3000

# Env
NODE_ENV=production  # ou staging, development
```

#### Frontend Nuxt
```bash
NUXT_PUBLIC_API_URL=https://api.metacult.app
NUXT_INTERNAL_API_URL=http://api.railway.internal:3000
NUXT_PUBLIC_WEBSITE_URL=https://www.metacult.app
```

#### Frontend Astro
```bash
PUBLIC_API_URL=https://api.metacult.app
INTERNAL_API_URL=http://api.railway.internal:3000
PUBLIC_WEBSITE_URL=https://www.metacult.app
```

---

### 📚 Documentation Complète

- **Guide Complet :** [docs/refacto-config-2025.md](./docs/refacto-config-2025.md)
- **Guide Migration :** [docs/MIGRATION-CONFIG-2025.md](./docs/MIGRATION-CONFIG-2025.md)
- **Exemple Config :** [.env.example](./.env.example)

---