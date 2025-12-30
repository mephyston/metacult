# MetaCult API

Backend API pour MetaCult (ElysiaJS + Drizzle + BullMQ).

## Configuration

Les variables d'environnement sont chargées depuis `apps/api/.env` (non versionné).

### Setup initial

```bash
# Copier le template
cp apps/api/.env.example apps/api/.env

# Éditer et remplir vos clés API
vim apps/api/.env
```

### Variables requises

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `IGDB_CLIENT_ID` | Twitch Client ID pour IGDB | https://dev.twitch.tv/console/apps |
| `IGDB_CLIENT_SECRET` | Twitch Client Secret | https://dev.twitch.tv/console/apps |
| `TMDB_API_KEY` | The Movie Database API Key | https://www.themoviedb.org/settings/api |
| `GOOGLE_BOOKS_API_KEY` | Google Books API Key | https://console.cloud.google.com/apis/credentials |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | - |

## Démarrage

```bash
# Development
bun run apps/api/index.ts

# Production (Docker)
docker-compose up api
```

## Architecture

- **Elysia** : Framework HTTP (TypeBox validation native)
- **Drizzle** : ORM TypeScript-first
- **BullMQ** : File d'attente pour imports asynchrones
- **Better Auth** : Authentification

Voir [AGENTS.md](../../AGENTS.md) pour les standards d'architecture.
