---
applyTo: '**'
---
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

Full standard is available here for further request: [AstroJS Development Standards](../../.packmind/standards/astrojs-development-standards.md)