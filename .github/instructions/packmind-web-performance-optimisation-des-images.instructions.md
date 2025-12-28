---
applyTo: '**'
---
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

Full standard is available here for further request: [Web Performance - Optimisation des Images](../../.packmind/standards/web-performance-optimisation-des-images.md)