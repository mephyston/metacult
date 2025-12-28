---
applyTo: '**'
---
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

Full standard is available here for further request: [Web Performance - Gestion des Scripts Tiers](../../.packmind/standards/web-performance-gestion-des-scripts-tiers.md)