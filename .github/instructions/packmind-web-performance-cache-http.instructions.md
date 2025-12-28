---
applyTo: '**'
---
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

Full standard is available here for further request: [Web Performance - Cache HTTP](../../.packmind/standards/web-performance-cache-http.md)