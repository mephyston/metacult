---
applyTo: '**'
---
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

Full standard is available here for further request: [Web Performance - Chargement JavaScript](../../.packmind/standards/web-performance-chargement-javascript.md)