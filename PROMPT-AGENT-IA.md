# 🎯 Mission: Atteindre 10/10 sur l'Audit Technique MetaCult

## Contexte
Monorepo NX avec Clean Architecture + DDD. Score actuel: **8.5/10**. Objectif: **10/10** en ~6 heures de travail réparties en 3 phases.

Stack: Bun, ElysiaJS 1.4.19, Drizzle 0.45.1, Astro 6.x, Nuxt 4.x, Vue 3 avec Composition API, TypeScript strict.

## PHASE 1: QUICK WINS (30 minutes → 9.3/10)

### Tâche 1.1: Validation TypeBox sur routes API (5 min)
**Fichier**: `libs/backend/catalog/src/api/routes.ts`

Remplacer les routes actuelles par:
```typescript
import { Elysia, t } from 'elysia';

const MediaTypeEnum = t.Union([
    t.Literal('game'),
    t.Literal('movie'),
    t.Literal('tv'),
    t.Literal('book'),
]);

export const catalogRoutes = new Elysia({ prefix: '/media' })
    .get('/search', async ({ query }) => {
        return mediaController.search(query);
    }, {
        query: t.Object({
            q: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            type: t.Optional(MediaTypeEnum),
            tag: t.Optional(t.String({ pattern: '^[a-z0-9-]+$' })),
        })
    })
    .post('/import', async ({ body }) => {
        return mediaController.import(body);
    }, {
        body: t.Object({
            mediaId: t.String({ minLength: 1 }),
            type: MediaTypeEnum,
        })
    });
```

**Critère validation**: Plus de `as any` dans les routes, requêtes invalides retournent 400.

---

### Tâche 1.2: Optimiser hydratation Astro (5 min)
**Fichier**: `apps/website/src/pages/index.astro`

Changer `client:load` en `client:idle` sur le composant Hero (ligne ~64):
```astro
<Hero
    client:idle  <!-- Au lieu de client:load -->
    badge="Nouvelle Version 2.0"
    heading="Le Radar Social..."
/>
```

**Critère validation**: TTI réduit de ~800ms (vérifier avec Lighthouse).

---

### Tâche 1.3: Optimiser images Astro (10 min)
**Fichier**: `apps/website/src/pages/index.astro`

Remplacer l'image Unsplash externe par:
```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';  // Télécharger et placer dans src/assets/
---

<Image
    src={heroImage}
    alt="MetaCult Hero"
    width={1920}
    height={1080}
    loading="eager"
    fetchpriority="high"
    format="avif"
    quality={85}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px"
/>
```

**Critère validation**: LCP < 2.5s, poids image réduit de ~60%.

---

### Tâche 1.4: Contraintes NX domain isolation (5 min)
**Fichier**: `eslint.config.mjs`

Ajouter dans `depConstraints` (après les règles layer existantes):
```javascript
{
    sourceTag: 'scope:catalog',
    onlyDependOnLibsWithTags: ['scope:catalog', 'scope:shared'],
    notDependOnLibsWithTags: ['scope:discovery', 'scope:marketing']
},
{
    sourceTag: 'scope:discovery',
    onlyDependOnLibsWithTags: ['scope:discovery', 'scope:shared'],
    notDependOnLibsWithTags: ['scope:catalog', 'scope:marketing']
},
```

**Critère validation**: `nx run-many -t lint` passe sans erreurs de boundaries.

---

### Tâche 1.5: Dockerfile Alpine + Railway Release (10 min)

**Fichier 1**: `apps/website/Dockerfile` (ligne 3)
```dockerfile
FROM oven/bun:1-alpine AS install  # Au lieu de oven/bun:1
```

**Fichier 2**: `apps/api/railway.json`
```json
{
    "build": {
        "builder": "DOCKERFILE",
        "dockerfilePath": "apps/api/Dockerfile"
    },
    "deploy": {
        "releaseCommand": "bun run db:migrate:prod",
        "startCommand": "bun apps/api/index.ts",
        "healthcheckPath": "/health"
    }
}
```

**Critère validation**: Build Docker -300MB, migrations séparées du runtime.

---

## PHASE 2: TESTS (3 heures → 9.7/10)

### Tâche 2.1: rating.vo.spec.ts (30 min)
**Fichier**: `libs/backend/catalog/src/domain/value-objects/rating.vo.spec.ts` (créer)

```typescript
import { describe, it, expect } from 'bun:test';
import { Rating } from './rating.vo';

describe('Rating VO', () => {
    describe('Validation', () => {
        it('should accept valid rating between 0 and 10', () => {
            expect(() => new Rating(0)).not.toThrow();
            expect(() => new Rating(5)).not.toThrow();
            expect(() => new Rating(10)).not.toThrow();
            expect(() => new Rating(7.5)).not.toThrow();
        });

        it('should reject rating > 10', () => {
            expect(() => new Rating(11)).toThrow('Rating must be between 0 and 10');
            expect(() => new Rating(100)).toThrow();
        });

        it('should reject rating < 0', () => {
            expect(() => new Rating(-1)).toThrow('Rating must be between 0 and 10');
            expect(() => new Rating(-0.1)).toThrow();
        });
    });

    describe('Value equality', () => {
        it('should be equal if same value', () => {
            const r1 = new Rating(8.5);
            const r2 = new Rating(8.5);
            expect(r1.getValue()).toBe(r2.getValue());
        });
    });
});
```

---

### Tâche 2.2: cover-url.vo.spec.ts (30 min)
**Fichier**: `libs/backend/catalog/src/domain/value-objects/cover-url.vo.spec.ts` (créer)

```typescript
import { describe, it, expect } from 'bun:test';
import { CoverUrl } from './cover-url.vo';

describe('CoverUrl VO', () => {
    describe('Validation', () => {
        it('should accept valid HTTPS URLs', () => {
            expect(() => new CoverUrl('https://example.com/cover.jpg')).not.toThrow();
            expect(() => new CoverUrl('https://cdn.igdb.com/123.png')).not.toThrow();
        });

        it('should reject non-HTTPS URLs', () => {
            expect(() => new CoverUrl('http://example.com/cover.jpg')).toThrow();
            expect(() => new CoverUrl('ftp://example.com/cover.jpg')).toThrow();
        });

        it('should reject invalid URLs', () => {
            expect(() => new CoverUrl('not-a-url')).toThrow();
            expect(() => new CoverUrl('')).toThrow();
        });
    });
});
```

---

### Tâche 2.3: release-year.vo.spec.ts (30 min)
**Fichier**: `libs/backend/catalog/src/domain/value-objects/release-year.vo.spec.ts` (créer)

```typescript
import { describe, it, expect } from 'bun:test';
import { ReleaseYear } from './release-year.vo';

describe('ReleaseYear VO', () => {
    const currentYear = new Date().getFullYear();

    describe('Validation', () => {
        it('should accept valid years', () => {
            expect(() => new ReleaseYear(2000)).not.toThrow();
            expect(() => new ReleaseYear(currentYear)).not.toThrow();
            expect(() => new ReleaseYear(1980)).not.toThrow();
        });

        it('should reject year < 1800', () => {
            expect(() => new ReleaseYear(1799)).toThrow();
        });

        it('should reject future years', () => {
            expect(() => new ReleaseYear(currentYear + 10)).toThrow();
        });
    });
});
```

---

### Tâche 2.4: Expansion tests Handler (1 heure)
**Fichier**: `libs/backend/catalog/src/application/commands/import-media/import-media.handler.spec.ts` (étendre existant)

Ajouter ces tests:
```typescript
describe('ImportMediaHandler - Extended', () => {
    it('should skip import if media already exists', async () => {
        const mockRepo = {
            findByExternalId: mock(() => Promise.resolve(existingMedia)),
            create: mock()
        };
        
        const handler = new ImportMediaHandler(mockRepo, mockAdapter);
        await handler.execute(command);
        
        expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should route GAME type to IgdbAdapter', async () => {
        const igdbSpy = mock(() => Promise.resolve(gameEntity));
        const handler = new ImportMediaHandler(repo, { fetch: igdbSpy }, tmdbAdapter, googleAdapter);
        
        await handler.execute(new ImportMediaCommand('123', MediaType.GAME));
        
        expect(igdbSpy).toHaveBeenCalledWith('123');
    });

    it('should route MOVIE type to TmdbAdapter', async () => {
        const tmdbSpy = mock(() => Promise.resolve(movieEntity));
        const handler = new ImportMediaHandler(repo, igdbAdapter, { fetch: tmdbSpy }, googleAdapter);
        
        await handler.execute(new ImportMediaCommand('456', MediaType.MOVIE));
        
        expect(tmdbSpy).toHaveBeenCalledWith('456');
    });

    it('should throw if provider returns null', async () => {
        const mockAdapter = { fetch: mock(() => Promise.resolve(null)) };
        const handler = new ImportMediaHandler(repo, mockAdapter);
        
        await expect(handler.execute(command)).rejects.toThrow('Media not found');
    });
});
```

---

### Tâche 2.5: Tests API routes (1 heure)
**Fichier**: `libs/backend/catalog/src/api/routes.spec.ts` (étendre existant)

```typescript
import { describe, it, expect } from 'bun:test';
import { Elysia } from 'elysia';
import { catalogRoutes } from './routes';

describe('Catalog Routes Integration', () => {
    const app = new Elysia().use(catalogRoutes);

    describe('GET /media/search', () => {
        it('should reject invalid type parameter', async () => {
            const response = await app.handle(
                new Request('http://localhost/media/search?type=invalid')
            );
            
            expect(response.status).toBe(400);
            const body = await response.json();
            expect(body.message).toContain('type');
        });

        it('should accept valid query params', async () => {
            const response = await app.handle(
                new Request('http://localhost/media/search?q=zelda&type=game')
            );
            
            expect(response.status).toBe(200);
        });

        it('should reject query with special characters in tag', async () => {
            const response = await app.handle(
                new Request('http://localhost/media/search?tag=test@invalid')
            );
            
            expect(response.status).toBe(400);
        });
    });

    describe('POST /media/import', () => {
        it('should reject missing mediaId', async () => {
            const response = await app.handle(
                new Request('http://localhost/media/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'game' })
                })
            );
            
            expect(response.status).toBe(400);
        });

        it('should accept valid import request', async () => {
            const response = await app.handle(
                new Request('http://localhost/media/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mediaId: '123', type: 'game' })
                })
            );
            
            expect([200, 201]).toContain(response.status);
        });
    });
});
```

---

## PHASE 3: EXCELLENCE (2 heures → 10/10)

### Tâche 3.1: DTOs CQRS (1 heure)

**Fichier 1**: `libs/backend/catalog/src/application/queries/search-media/media-read.dto.ts` (créer)
```typescript
export interface MediaReadDto {
    id: string;
    title: string;
    type: 'game' | 'movie' | 'tv' | 'book';
    coverUrl: string | null;
    rating: number | null;
    releaseYear: number | null;
    description: string | null;
}
```

**Fichier 2**: `libs/backend/catalog/src/application/queries/search-media/search-media.handler.ts`

Modifier pour retourner DTOs:
```typescript
import { MediaReadDto } from './media-read.dto';

export class SearchMediaHandler {
    async execute(query: SearchMediaQuery): Promise<MediaReadDto[]> {
        const rows = await this.db
            .select({
                id: medias.id,
                title: medias.title,
                type: medias.type,
                coverUrl: medias.coverUrl,
                rating: medias.globalRating,
                releaseYear: medias.releaseYear,
                description: medias.description,
            })
            .from(medias)
            .where(/* filtres */);
        
        return rows;  // ✅ Pas d'hydratation d'entités
    }
}
```

---

### Tâche 3.2: UUID obligatoire dans mappers (1 heure)

**Fichier**: `libs/backend/catalog/src/infrastructure/adapters/mappers.ts`

Retirer le paramètre par défaut:
```typescript
// AVANT
export function mapGameToEntity(raw: IgdbGameRaw, id: string = uuidv4()): Game {

// APRÈS
export function mapGameToEntity(raw: IgdbGameRaw, id: string): Game {
```

**Fichier**: `libs/backend/catalog/src/infrastructure/repositories/drizzle-media.repository.ts`

Générer l'ID dans le Repository:
```typescript
import { v4 as uuidv4 } from 'uuid';

async create(media: Omit<Media, 'id'>): Promise<Media> {
    const id = uuidv4();  // ✅ Repository gère l'ID
    
    const fullMedia = new Media(id, ...media);
    
    await this.db.insert(medias).values({
        id,
        title: fullMedia.title,
        // ...
    });
    
    return fullMedia;
}
```

---

## CRITÈRES DE VALIDATION FINALE

Exécuter ces commandes pour vérifier:
```bash
# 1. Linting avec boundaries
nx run-many -t lint

# 2. Tests avec couverture ≥ 60%
bun test --coverage

# 3. Build sans erreurs
nx run-many -t build

# 4. Performance Lighthouse (apps/website)
# LCP < 2.5s, TTI < 2s, CLS < 0.1
```

## SCORES ATTENDUS APRÈS IMPLÉMENTATION

| Catégorie | Avant | Phase 1 | Phase 2 | Phase 3 |
|-----------|-------|---------|---------|---------|
| Backend Architecture | 8/10 | 8/10 | 8/10 | **10/10** |
| ElysiaJS | 9/10 | **10/10** | 10/10 | 10/10 |
| Frontend | 7/10 | **9/10** | 9/10 | 9/10 |
| NX Boundaries | 7/10 | **10/10** | 10/10 | 10/10 |
| Infrastructure | 8/10 | **10/10** | 10/10 | 10/10 |
| Tests | 4/10 | 4/10 | **10/10** | 10/10 |
| Encapsulation | 10/10 | 10/10 | 10/10 | 10/10 |
| **GLOBAL** | **8.5/10** | **9.3/10** | **9.7/10** | **10/10** |

---

## NOTES IMPORTANTES

- Suivre les standards Packmind attachés (AstroJS, VueJS 3, Web Performance)
- Utiliser TypeScript strict mode
- Respecter Clean Architecture (domain ne dépend jamais de infrastructure)
- Tester après chaque phase avec les commandes de validation
- Si blocage, consulter `AUDIT-TECHNIQUE-2025.md` sections détaillées

**Temps total estimé: ~6 heures sur 1 semaine**
