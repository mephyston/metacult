# Tests E2E Metacult

Tests end-to-end avec Playwright pour valider les flux critiques d'acquisition et d'engagement utilisateur.

## Installation

```bash
# Installer les dépendances
bun install

# Installer les navigateurs Playwright
bunx playwright install chromium
```

Ou avec NX:

```bash
bunx nx run e2e:install
```

## Lancer les tests

### Prérequis

Les 3 serveurs doivent être lancés avant les tests:

```bash
# Terminal 1: Website (Astro)
bun run --filter=website dev

# Terminal 2: Webapp (Nuxt)
bun run --filter=webapp dev

# Terminal 3: API (ElysiaJS)
bun run --filter=api dev
```

Ou avec docker-compose:

```bash
docker-compose up
```

### Commandes de test

```bash
# Lancer tous les tests (headless)
bunx nx run e2e:test

# Mode UI interactif (recommandé pour développement)
bunx nx run e2e:test:ui

# Mode debug (arrêt sur chaque étape)
bunx nx run e2e:test:debug

# Lancer avec le navigateur visible
bunx playwright test --headed

# Lancer un seul fichier
bunx playwright test tests/guest-sync.spec.ts
```

## Structure

```
apps/e2e/
├── tests/
│   └── guest-sync.spec.ts    # Test du flux Guest → Signup → Sync
├── playwright.config.ts       # Configuration Playwright
├── package.json
└── README.md
```

## Scénarios de test

### Guest Sync Flow

**Objectif:** Valider que les swipes d'un utilisateur non connecté sont sauvegardés après inscription.

**Steps:**
1. ✅ Charger la Home Page (localhost:4321)
2. ✅ Swiper sur 3 médias (Like)
3. ✅ Vérifier l'apparition du bouton "Créer un compte"
4. ✅ Cliquer et vérifier la redirection avec `?sync=...`
5. ✅ Remplir le formulaire d'inscription (email unique)
6. ✅ Vérifier la redirection vers le Dashboard
7. ✅ Vérifier que les 3 interactions sont en DB (via API)

## Data Test IDs

Pour que les tests fonctionnent, ajouter ces `data-testid` dans vos composants:

**Website (Astro):**
- `data-testid="swipe-deck"` sur le composant SwipeDeck
- `data-testid="btn-like"` sur le bouton Like
- `data-testid="btn-dislike"` sur le bouton Dislike
- `data-testid="btn-signup"` sur le bouton "Créer un compte"

**Webapp (Nuxt):**
- `data-testid="signup-form"` sur le formulaire d'inscription
- `data-testid="dashboard"` sur la page Dashboard
- `data-testid="user-menu"` sur le menu utilisateur

## CI/CD

Pour intégrer dans votre pipeline CI/CD:

```yaml
# .github/workflows/e2e.yml
- name: Install Playwright
  run: bunx playwright install chromium

- name: Run E2E Tests
  run: bunx nx run e2e:test
  env:
    CI: true
```

## Debugging

```bash
# Voir les traces d'un test échoué
bunx playwright show-trace test-results/.../trace.zip

# Générer le rapport HTML
bunx playwright show-report
```
