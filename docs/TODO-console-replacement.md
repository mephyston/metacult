# TODO: Replace remaining console statements with logger

## Fichiers avec console.log/warn/error restants

### Backend - Controllers & Handlers (14 fichiers restants)

**Catalog:**
- [ ] `libs/backend/catalog/src/application/queries/get-media-by-id/get-media-by-id.handler.ts` (2 occurrences)
- [ ] `libs/backend/catalog/src/application/queries/search-media/search-media.handler.ts` (7 occurrences)
- [ ] `libs/backend/catalog/src/application/queries/get-recent-media/get-recent-media.handler.ts` (2 occurrences)
- [ ] `libs/backend/catalog/src/application/queries/get-top-rated-media/get-top-rated-media.handler.ts` (2 occurrences)
- [ ] `libs/backend/catalog/src/infrastructure/repositories/drizzle-media.repository.ts` (2 occurrences)
- [ ] `libs/backend/catalog/src/infrastructure/providers/igdb.provider.ts` (5 occurrences)
- [ ] `libs/backend/catalog/src/infrastructure/providers/tmdb.provider.ts` (4 occurrences)
- [ ] `libs/backend/catalog/src/infrastructure/providers/google-books.provider.ts` (4 occurrences)

**Discovery:**
- [ ] `libs/backend/discovery/src/api/http/controllers/feed.controller.ts` (7 occurrences)
- [ ] `libs/backend/discovery/src/application/queries/get-mixed-feed/get-mixed-feed.handler.ts` (7 occurrences)

**Identity:**
- [ ] `libs/backend/identity/src/api/helpers/auth.helper.ts` (4 occurrences)
- [ ] `libs/backend/identity/src/api/middleware/auth.middleware.ts` (10 occurrences)

**Interaction:**
- [ ] `libs/backend/interaction/src/api/http/controllers/interaction.controller.ts` (2 occurrences)
- [ ] `libs/backend/interaction/src/application/commands/sync-interactions.command.ts` (5 occurrences)

**Ranking:**
- [ ] `libs/backend/ranking/src/api/http/controllers/duel.controller.ts` (1 occurrence)
- [ ] `libs/backend/ranking/src/api/http/controllers/ranking.controller.ts` (1 occurrence)
- [ ] `libs/backend/ranking/src/infrastructure/queue/ranking.queue.ts` (1 occurrence)

**Marketing:**
- [ ] `libs/backend/marketing/src/application/queries/get-active-ads/get-active-ads.handler.ts` (1 occurrence)

### Backend - Infrastructure (7 fichiers)

- [ ] `libs/backend/infrastructure/src/lib/cache/cache.service.ts` (4 occurrences) - warnings sur cache failures
- [ ] `libs/backend/infrastructure/src/lib/db/client.ts` (2 occurrences) - connexion DB
- [ ] `libs/backend/infrastructure/src/lib/redis/redis.client.ts` (3 occurrences) - connexion Redis
- [ ] `libs/backend/infrastructure/src/lib/queue/queue.client.ts` (3 occurrences) - jobs queue
- [ ] `libs/backend/infrastructure/src/lib/db/migrate.ts` (6 occurrences) - migrations
- [ ] `libs/backend/infrastructure/src/lib/config/configuration.service.ts` (2 occurrences) - config errors
- [ ] `libs/backend/infrastructure/src/index.ts` (1 occurrence commenté) - peut être supprimé

### Apps (4 fichiers)

- [ ] `apps/api/src/cron/cron.service.ts` (2 occurrences) - init cron jobs
- [ ] `apps/worker/src/processors/import-media.processor.ts` (14 occurrences) - worker logs
- [ ] `apps/worker/src/processors/ranking.processor.ts` (2 occurrences)
- [ ] `apps/api/src/routes/debug.routes.ts` (1 occurrence) - route de debug
- [ ] `apps/api/index.ts` (1 occurrence restante)
- [ ] `apps/worker/src/index.ts` (1 occurrence restante)

### Scripts (à NE PAS modifier - OK pour console.log)

- `libs/backend/infrastructure/src/lib/db/seed.ts` - script de seed
- `libs/backend/infrastructure/src/lib/db/scripts/reset-db.ts` - script reset DB
- `libs/backend/infrastructure/src/lib/db/migrate-prod.ts` - script de migration production

---

## Progression

- ✅ **Phase 1 complétée** : Error middleware, API startup, Worker startup, Import media handler (8 fichiers)
- 🔄 **Phase 2 en cours** : Handlers queries catalog, providers, controllers
- ⏳ **Phase 3 à venir** : Infrastructure (cache, db, redis, queue)
- ⏳ **Phase 4 à venir** : Remaining apps

**Total estimé** : ~80 occurrences de console dans ~30 fichiers
**Complété** : ~20 occurrences (25%)
**Restant** : ~60 occurrences (75%)

---

## Template de remplacement

```typescript
// ❌ AVANT
console.log('User logged in:', userId);
console.error('Failed to fetch:', error);
console.warn('Cache miss for key:', key);

// ✅ APRÈS  
logger.info({ userId }, 'User logged in');
logger.error({ err: error }, 'Failed to fetch');
logger.warn({ key }, 'Cache miss');
```

## Commande pour trouver les fichiers restants

```bash
find libs/backend apps -name "*.ts" \
  -not -name "*.test.ts" \
  -not -name "*.spec.ts" \
  -not -name "test-*.ts" \
  -not -name "migrate-prod.ts" \
  -not -name "seed.ts" \
  -not -name "reset-db.ts" \
  -exec grep -l "console\.\(log\|warn\|error\)" {} \;
```
