---
applyTo: '**'
---
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

Full standard is available here for further request: [Web Performance - Optimisation des Fonts](../../.packmind/standards/web-performance-optimisation-des-fonts.md)