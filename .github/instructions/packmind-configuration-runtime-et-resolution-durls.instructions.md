---
applyTo: '**'
---
## Standard: Configuration Runtime et Résolution d'URLs

Pratiques pour configuration runtime type-safe, Split Horizon URLs (interne/publique), validation TypeBox, et élimination des URLs hardcodées. :
* Astro: Distinguer variables SSR (INTERNAL_*) et client-side (PUBLIC_*) avec import.meta.env.SSR pour le routing.
* Backend: Utiliser TypeBox pour validation stricte des variables d'environnement au démarrage avec fail-fast si config invalide.
* Centraliser toutes les URLs de développement par défaut dans un fichier de constantes partagé (ex: DEFAULT_DEV_URLS), jamais de strings hardcodées dispersées dans le code.
* Convention de nommage stricte: PUBLIC_* pour variables exposées au client, INTERNAL_* pour réseau privé, pas de préfixe pour backend uniquement.
* Documenter toutes les variables d'environnement requises dans .env.example avec exemples dev/staging/prod.
* Exporter les constantes de configuration depuis un package partagé (@metacult/shared-core) accessible par tous les modules.
* Implémenter Split Horizon URLs: INTERNAL_* pour réseau privé (S2S, Railway), PUBLIC_* pour réseau public (client browser).
* Limiter les fallbacks aux constantes de développement, jamais de fallbacks silencieux en production.
* Nuxt: Utiliser runtimeConfig pour permettre injection des variables au lancement Docker sans rebuild.
* Valider le protocole des URLs (http:// ou https://) et ajouter automatiquement si manquant selon le contexte (http en dev, https en prod).

Full standard is available here for further request: [Configuration Runtime et Résolution d'URLs](../../.packmind/standards/configuration-runtime-et-resolution-durls.md)