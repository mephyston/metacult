# Docker Multi-Stage Builds Bun

Ce standard définit les pratiques pour créer des images Docker optimisées avec multi-stage builds, cache layers intelligents, images Alpine légères, et sécurité (USER non-root). Il couvre la structure des stages (dependencies, build, production), la configuration HEALTHCHECK, l'utilisation de .dockerignore, et l'optimisation de la taille finale. À appliquer sur tous les Dockerfiles pour réduire les temps de build et la taille des images déployées.

## Rules

* Utiliser oven/bun:alpine comme image de base (plus légère que debian).
* Séparer les stages en dependencies, build, production pour optimiser le cache.
* Copier package.json et bun.lockb AVANT le code pour cache layer des dépendances.
* Installer les dépendances avec bun install --frozen-lockfile en stage dependencies.
* Utiliser COPY --from=dependencies pour réutiliser node_modules entre stages.
* Exposer le port avec EXPOSE 3000 (documentatif pour Railway/docker-compose).
* Définir un USER non-root pour sécurité (USER bun en production).
* Utiliser .dockerignore pour exclure node_modules, .nx, .git du contexte de build.
* Configurer HEALTHCHECK avec curl ou wget pour monitoring automatique.
* Passer les variables d'environnement via docker-compose.yml ou Railway (pas COPY .env).
* Optimiser la taille finale avec apk del après installation si packages temporaires nécessaires.
* Utiliser CMD avec forme exec ["bun", "run", "start"] comme entrypoint (pas shell form).
