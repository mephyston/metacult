---
applyTo: '**'
---
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

Full standard is available here for further request: [Web Performance - Seuils et Métriques](../../.packmind/standards/web-performance-seuils-et-metriques.md)