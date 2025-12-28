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