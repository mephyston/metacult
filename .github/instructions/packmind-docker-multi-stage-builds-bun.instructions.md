---
applyTo: '**'
---
## Standard: Docker Multi-Stage Builds Bun

Pratiques Docker multi-stage avec Bun pour images optimis\u00e9es, cache intelligent et s\u00e9curit\u00e9. :
* Configurer HEALTHCHECK avec curl ou wget pour monitoring automatique.
* Copier package.json et bun.lockb AVANT le code pour cache layer des dépendances.
* Définir un USER non-root pour sécurité (USER bun en production).
* Exposer le port avec EXPOSE 3000 (documentatif pour Railway/docker-compose).
* Installer les dépendances avec bun install --frozen-lockfile en stage dependencies.
* Optimiser la taille finale avec apk del après installation si packages temporaires nécessaires.
* Passer les variables d'environnement via docker-compose.yml ou Railway (pas COPY .env).
* Séparer les stages en dependencies, build, production pour optimiser le cache.
* Utiliser .dockerignore pour exclure node_modules, .nx, .git du contexte de build.
* Utiliser CMD avec forme exec ["bun", "run", "start"] comme entrypoint (pas shell form).
* Utiliser COPY --from=dependencies pour réutiliser node_modules entre stages.
* Utiliser oven/bun:alpine comme image de base (plus légère que debian).

Full standard is available here for further request: [Docker Multi-Stage Builds Bun](../../.packmind/standards/docker-multi-stage-builds-bun.md)