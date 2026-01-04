## 0.6.6 (2026-01-04)

### 🩹 Fixes

- **api:** bind to :: for ipv6 support in railway private network ([fdc18e4](https://github.com/mephyston/metacult/commit/fdc18e4))

### ❤️ Thank You

- David PAGNACCO

## 0.6.5 (2026-01-04)

This was a version bump only, there were no code changes.

## 0.6.4 (2026-01-04)

### 🩹 Fixes

- **catalog:** use higher quality igdb images (t_cover_big) ([faa3e13](https://github.com/mephyston/metacult/commit/faa3e13))
- **config:** auto-detect NODE_ENV from RAILWAY_ENVIRONMENT_NAME ([7e20ee4](https://github.com/mephyston/metacult/commit/7e20ee4))
- **webapp:** bypass nuxt proxy for duel api to fix staging 502, dynamic proxy rule ([d59f381](https://github.com/mephyston/metacult/commit/d59f381))
- **webapp:** add credentials:include to useDuel fetch for cross-origin auth ([6ddf5bc](https://github.com/mephyston/metacult/commit/6ddf5bc))

### ❤️ Thank You

- David PAGNACCO

## 0.6.3 (2026-01-04)

### 🩹 Fixes

- **staging:** fix ranking queue redis config and search redirection ([ef921f8](https://github.com/mephyston/metacult/commit/ef921f8))
- **website:** use getApiUrl in slug page instead of localhost ([b3e26b9](https://github.com/mephyston/metacult/commit/b3e26b9))

### ❤️ Thank You

- David PAGNACCO

## 0.6.2 (2026-01-04)

### 🩹 Fixes

- **shared:** prioritize INTERNAL_API_URL over railway API_URL ([dc3b5be](https://github.com/mephyston/metacult/commit/dc3b5be))

### ❤️ Thank You

- David PAGNACCO

## 0.6.1 (2026-01-04)

### 🩹 Fixes

- **infra:** allow ipv6 for redis and enable logs ([39d9b99](https://github.com/mephyston/metacult/commit/39d9b99))

### ❤️ Thank You

- David PAGNACCO

## 0.6.0 (2026-01-04)

### 🩹 Fixes

- **ui:** remove double version prefix in footer ([39fa733](https://github.com/mephyston/metacult/commit/39fa733))
- **webapp:** inject window.__ENV__ for shared-ui url resolution ([dbc921d](https://github.com/mephyston/metacult/commit/dbc921d))

### ❤️ Thank You

- David PAGNACCO

## 0.5.1 (2026-01-04)

### 🩹 Fixes

- **ci:** remove unsupported --yes flag from railway variables command ([7313799](https://github.com/mephyston/metacult/commit/7313799))
- **ci:** simplify job name to fix github actions display ([0045188](https://github.com/mephyston/metacult/commit/0045188))

### ❤️ Thank You

- David PAGNACCO

## 0.5.0 (2026-01-04)

### 🩹 Fixes

- **ci:** fix railway variables set command syntax ([f40b8db](https://github.com/mephyston/metacult/commit/f40b8db))
- **ci:** quote job name to fix github actions display ([c2a720a](https://github.com/mephyston/metacult/commit/c2a720a))

### ❤️ Thank You

- David PAGNACCO

## 0.4.0 (2026-01-04)

### 🚀 Features

- **ci:** implement hybrid versioning strategy (immutable SHA + dynamic Version) ([7c2c176](https://github.com/mephyston/metacult/commit/7c2c176))
- **ui:** standardize version display in webapp and website ([beca74c](https://github.com/mephyston/metacult/commit/beca74c))

### 🩹 Fixes

- **api:** standardizing version display (ignore package.json version) ([9b81e49](https://github.com/mephyston/metacult/commit/9b81e49))
- **ci:** delete .husky in release job ([0285b1b](https://github.com/mephyston/metacult/commit/0285b1b))

### ❤️ Thank You

- David PAGNACCO

## 0.3.0 (2026-01-04)

### 🚀 Features

- Configure NX strict boundaries for Clean Architecture ([c3e4fea](https://github.com/mephyston/metacult/commit/c3e4fea))
- complete guest sync flow refactoring and testing ([6ab2c63](https://github.com/mephyston/metacult/commit/6ab2c63))
- ⚠️  implement structured logging & error handling ([26ed946](https://github.com/mephyston/metacult/commit/26ed946))
- **auth:** Better Auth integration with SPA navigation ([cbd2eb7](https://github.com/mephyston/metacult/commit/cbd2eb7))
- **auth:** advanced configuration for cross-domain and staging isolation ([a4d32a8](https://github.com/mephyston/metacult/commit/a4d32a8))
- **auth:** implement global route guard and error handling ([3fbf185](https://github.com/mephyston/metacult/commit/3fbf185))
- **backend:** implement hardened HttpClient with Retry/Timeout and refactor providers ([468807e](https://github.com/mephyston/metacult/commit/468807e))
- **backend:** création Bounded Context Identity ([bc3fdfa](https://github.com/mephyston/metacult/commit/bc3fdfa))
- **catalog:** implement trends endpoint (top elo) ([8475b27](https://github.com/mephyston/metacult/commit/8475b27))
- **debug:** enhance sharp debug endpoint with FS report and fix types ([ddaf3c5](https://github.com/mephyston/metacult/commit/ddaf3c5))
- **debug:** add file system inspection endpoint ([2486837](https://github.com/mephyston/metacult/commit/2486837))
- **discovery:** auto-reload feed when running low on content ([baec3b3](https://github.com/mephyston/metacult/commit/baec3b3))
- **e2e:** Setup Playwright tests for Guest Sync Flow ([b632a18](https://github.com/mephyston/metacult/commit/b632a18))
- **e2e:** Add data-testid attributes for E2E testing ([2e9e909](https://github.com/mephyston/metacult/commit/2e9e909))
- **feed:** implement tests, ranking module and pre-commit hooks ([1e37340](https://github.com/mephyston/metacult/commit/1e37340))
- **feed:** implement guest/user feed logic, discover page & interaction fix ([e12b4ae](https://github.com/mephyston/metacult/commit/e12b4ae))
- **frontend:** replace all console statements with logger ([3f7ad44](https://github.com/mephyston/metacult/commit/3f7ad44))
- **i18n:** eliminate ALL magic strings from backend and frontend ([bb4a1e3](https://github.com/mephyston/metacult/commit/bb4a1e3))
- **i18n:** eliminate all magic strings from backend and frontends ([65f1451](https://github.com/mephyston/metacult/commit/65f1451))
- **infra:** add secure migration script with advisory lock and configure railway start command ([6e9962c](https://github.com/mephyston/metacult/commit/6e9962c))
- **interaction:** create interaction module with schema and repository ([1515e6b](https://github.com/mephyston/metacult/commit/1515e6b))
- **interaction:** add interaction save tests and fix SwipeDeck mediaId mapping ([ca41720](https://github.com/mephyston/metacult/commit/ca41720))
- **ops:** expose version/commit and fix local auth/website header ([48b6316](https://github.com/mephyston/metacult/commit/48b6316))
- **ranking:** add user personal ranking strategy with ELO replay ([8c23598](https://github.com/mephyston/metacult/commit/8c23598))
- **seo:** Implement Slug URLs, Search improvements and Tests ([25ea55b](https://github.com/mephyston/metacult/commit/25ea55b))
- **ui:** implement dynamic theming with Tailwind v4 & multiple themes ([dce61c5](https://github.com/mephyston/metacult/commit/dce61c5))
- **ui:** unify nuxt/astro layout, fix FOUC & theme consistency ([0d316b0](https://github.com/mephyston/metacult/commit/0d316b0))
- **ui:** implement Joystick Swipe component and integrate into webapp ([ec47d3d](https://github.com/mephyston/metacult/commit/ec47d3d))
- **ui:** implement mega menu in Header component ([e030701](https://github.com/mephyston/metacult/commit/e030701))
- **ui:** implement split-horizon routing in getApiUrl with TS fix ([f87f735](https://github.com/mephyston/metacult/commit/f87f735))
- **webapp:** create gamified dashboard with stats and missions ([7fcaa1e](https://github.com/mephyston/metacult/commit/7fcaa1e))
- **webapp:** add clickable links to trends leading to Astro media pages ([3ec69fc](https://github.com/mephyston/metacult/commit/3ec69fc))
- **website:** enable prerender and build-time image optimization, move data fetch to client ([898b650](https://github.com/mephyston/metacult/commit/898b650))
- **website:** integrate trends API in Hero component ([d004cad](https://github.com/mephyston/metacult/commit/d004cad))

### 🩹 Fixes

- dependency resolution and api url for railway deployment ([94ee8c2](https://github.com/mephyston/metacult/commit/94ee8c2))
- add #imports comments for Nuxt auto-imports ([bb7b072](https://github.com/mephyston/metacult/commit/bb7b072))
- replace last console.error in backend with logger ([7307577](https://github.com/mephyston/metacult/commit/7307577))
- complete bunfig.toml aliases and disable e2e tests temporarily ([967d3d7](https://github.com/mephyston/metacult/commit/967d3d7))
- correct tsconfig.base.json duplicate keys and improve Docker config copy ([2456a5e](https://github.com/mephyston/metacult/commit/2456a5e))
- **all:** resolve backend ssl, frontend import and test mocks ([5a13675](https://github.com/mephyston/metacult/commit/5a13675))
- **api:** resolve migration script import path ([3c7ac85](https://github.com/mephyston/metacult/commit/3c7ac85))
- **api:** restore missing requestId variable in fetch wrapper ([68a2839](https://github.com/mephyston/metacult/commit/68a2839))
- **api:** bind to IPv6 (::) to match railway private network stack ([6807eb8](https://github.com/mephyston/metacult/commit/6807eb8))
- **api:** bind to 0.0.0.0 instead of :: for railway healthcheck compatibility ([4ba6fb0](https://github.com/mephyston/metacult/commit/4ba6fb0))
- **api:** make migrations non-blocking to prevent boot hang and healthcheck failure ([4418b95](https://github.com/mephyston/metacult/commit/4418b95))
- **api:** default to port 8080 to match Railway internal expectations ([3b5e56c](https://github.com/mephyston/metacult/commit/3b5e56c))
- **api:** switch to debian base image to resolve redis timeout ([773b5ef](https://github.com/mephyston/metacult/commit/773b5ef))
- **auth:** allow configuring trustedOrigins via environment variable ([cdd7b27](https://github.com/mephyston/metacult/commit/cdd7b27))
- **backend:** apply default values in configuration service ([913ef61](https://github.com/mephyston/metacult/commit/913ef61))
- **backend:** map PORT to API_PORT for Railway support ([d3d6714](https://github.com/mephyston/metacult/commit/d3d6714))
- **backend:** force IPv4 for Redis client to prevent ETIMEDOUT ([fdf5fbd](https://github.com/mephyston/metacult/commit/fdf5fbd))
- **backend-ranking:** migrate deprecated @nx/linter to @nx/eslint ([e1d0c09](https://github.com/mephyston/metacult/commit/e1d0c09))
- **backend-ranking:** add test setup preload to nx target ([eeaaad8](https://github.com/mephyston/metacult/commit/eeaaad8))
- **catalog:** resolve linting errors in regex and unused suppressions ([556a82d](https://github.com/mephyston/metacult/commit/556a82d))
- **catalog:** resolve runtime TypeError in adapters by matching provider methods ([89c5c31](https://github.com/mephyston/metacult/commit/89c5c31))
- **catalog:** handle 409 conflict on import with redirect to existing media ([ac5549b](https://github.com/mephyston/metacult/commit/ac5549b))
- **chore:** restore cookiePrefix definition in auth-client ([9c08ee7](https://github.com/mephyston/metacult/commit/9c08ee7))
- **chore:** move import to top level in useGuestSync ([84b0a0c](https://github.com/mephyston/metacult/commit/84b0a0c))
- **ci:** specify linux/amd64 platform for Docker builds ([c1a3003](https://github.com/mephyston/metacult/commit/c1a3003))
- **ci:** resolve Railway CLI and Docker build issues ([c23ece9](https://github.com/mephyston/metacult/commit/c23ece9))
- **ci:** resolve Nx build loop and Railway service names ([9704cd8](https://github.com/mephyston/metacult/commit/9704cd8))
- **ci:** correct nx release command syntax ([ec6f8d5](https://github.com/mephyston/metacult/commit/ec6f8d5))
- **ci:** atomic deployment strategy ([7919329](https://github.com/mephyston/metacult/commit/7919329))
- **ci:** disable husky during release ([91e7812](https://github.com/mephyston/metacult/commit/91e7812))
- **config:** add layer:backend tag to interaction module ([73a05c2](https://github.com/mephyston/metacult/commit/73a05c2))
- **db:** make initial migration idempotent with DO block ([c6ae68f](https://github.com/mephyston/metacult/commit/c6ae68f))
- **db:** ensure migration is fully idempotent with IF NOT EXISTS ([21af4b0](https://github.com/mephyston/metacult/commit/21af4b0))
- **db:** ensure users table and constraints are fully idempotent ([cadf288](https://github.com/mephyston/metacult/commit/cadf288))
- **db:** regenerate migrations to include correct schemas ([373ffe5](https://github.com/mephyston/metacult/commit/373ffe5))
- **deploy:** use robust migration script in start.sh ([aae2d3c](https://github.com/mephyston/metacult/commit/aae2d3c))
- **deploy:** force migration run in api entrypoint ([666b1ad](https://github.com/mephyston/metacult/commit/666b1ad))
- **deploy:** enforce NODE_ENV=production to silence debug logs ([7784a1d](https://github.com/mephyston/metacult/commit/7784a1d))
- **deploy:** use node:20 full image for sharp libs and revert api bind to 0.0.0.0 ([71e3cb0](https://github.com/mephyston/metacult/commit/71e3cb0))
- **deploy:** copy package.json for npm context and use rebuild sharp ([5bbf405](https://github.com/mephyston/metacult/commit/5bbf405))
- **deploy:** use bun to install sharp in docker to avoid npm arborist crash ([04cd421](https://github.com/mephyston/metacult/commit/04cd421))
- **deploy:** side-load sharp to guarantee node compatibility ([64d88ce](https://github.com/mephyston/metacult/commit/64d88ce))
- **discovery:** prevent duplicate media in feed queue ([eaeb631](https://github.com/mephyston/metacult/commit/eaeb631))
- **discovery:** reduce feed cache TTL from 1h to 60s ([25d3941](https://github.com/mephyston/metacult/commit/25d3941))
- **discovery:** send client-side exclusions and fix auto-reload ([0924ded](https://github.com/mephyston/metacult/commit/0924ded))
- **discovery:** implement inline auth derivation for feed controller ([cf876c4](https://github.com/mephyston/metacult/commit/cf876c4))
- **docker:** remove missing ranking package.json copy ([f7151c6](https://github.com/mephyston/metacult/commit/f7151c6))
- **docker:** standardize worker dockerfile to match api pattern ([55fe8ca](https://github.com/mephyston/metacult/commit/55fe8ca))
- **docker:** remove copy of missing backend lib package.jsons ([0afed94](https://github.com/mephyston/metacult/commit/0afed94))
- **docker:** add shared/core package.json copy ([56465f3](https://github.com/mephyston/metacult/commit/56465f3))
- **docker:** replace bun.lockb with bun.lock in all Dockerfiles ([db6fb3a](https://github.com/mephyston/metacult/commit/db6fb3a))
- **docker:** copy backend libs package.json for bun install ([ecb3870](https://github.com/mephyston/metacult/commit/ecb3870))
- **docker:** copy apps/e2e package.json for bun install ([6e205fb](https://github.com/mephyston/metacult/commit/6e205fb))
- **docker:** add --ignore-scripts to all bun install commands ([e27f09d](https://github.com/mephyston/metacult/commit/e27f09d))
- **docker:** bypass Nx graph construction by using direct build commands ([84fdb37](https://github.com/mephyston/metacult/commit/84fdb37))
- **docker:** add bunfig.toml for path aliases resolution in production ([0719d4b](https://github.com/mephyston/metacult/commit/0719d4b))
- **docker:** use absolute paths in CMD for api and worker ([e99cf1a](https://github.com/mephyston/metacult/commit/e99cf1a))
- **docker:** correct API entrypoint path (index.ts at root, not in src/) ([4e1b92b](https://github.com/mephyston/metacult/commit/4e1b92b))
- **docker:** install all dependencies to resolve monorepo workspace libs ([a74a988](https://github.com/mephyston/metacult/commit/a74a988))
- **docker:** update dockerfiles, ignores and config for deployment ([7055a32](https://github.com/mephyston/metacult/commit/7055a32))
- **docker:** switch website and webapp to debian base image for stability ([ef95879](https://github.com/mephyston/metacult/commit/ef95879))
- **e2e:** Update ports and localStorage key for E2E tests ([6bbba0d](https://github.com/mephyston/metacult/commit/6bbba0d))
- **e2e:** Improve guest sync test robustness ([f235b43](https://github.com/mephyston/metacult/commit/f235b43))
- **e2e:** Add missing name field to signup tests ([99199a6](https://github.com/mephyston/metacult/commit/99199a6))
- **e2e:** Use data-testid for name input field ([f32ed25](https://github.com/mephyston/metacult/commit/f32ed25))
- **e2e:** Use form.requestSubmit() instead of button click ([361b1e4](https://github.com/mephyston/metacult/commit/361b1e4))
- **e2e:** Dispatch submit event to trigger Vue @submit.prevent handler ([eae8ef9](https://github.com/mephyston/metacult/commit/eae8ef9))
- **e2e:** Remove HTMLFormElement type annotation ([bdb6d84](https://github.com/mephyston/metacult/commit/bdb6d84))
- **e2e:** Use Promise.all for click and navigation wait ([030ba45](https://github.com/mephyston/metacult/commit/030ba45))
- **e2e:** Wait 2s for Vue hydration before submit ([b0f1bf9](https://github.com/mephyston/metacult/commit/b0f1bf9))
- **e2e:** Remove duplicate waitForURL ([d99e891](https://github.com/mephyston/metacult/commit/d99e891))
- **e2e:** Increase Vue hydration wait time to 3s + networkidle ([0726d53](https://github.com/mephyston/metacult/commit/0726d53))
- **e2e:** Make signup URL reactive in SwipeDeck ([5ee83f6](https://github.com/mephyston/metacult/commit/5ee83f6))
- **e2e:** Fix href verification + locator specificity + error test ([00001de](https://github.com/mephyston/metacult/commit/00001de))
- **global:** replace all remaining hardcoded localhost urls with shared utilities ([1cc57db](https://github.com/mephyston/metacult/commit/1cc57db))
- **identity:** resolve TypeScript errors in middleware and tsconfig ([8ea2219](https://github.com/mephyston/metacult/commit/8ea2219))
- **identity:** add maybeAuthenticated middleware for optional auth ([42fcb9c](https://github.com/mephyston/metacult/commit/42fcb9c))
- **infra:** debug migration folder path ([df04178](https://github.com/mephyston/metacult/commit/df04178))
- **infra:** silence logs and repair migration loop ([690522f](https://github.com/mephyston/metacult/commit/690522f))
- **infra:** resolve linting errors preventing push ([d6ba98c](https://github.com/mephyston/metacult/commit/d6ba98c))
- **infra:** resolve lint error and register interaction schema in API ([a3cf459](https://github.com/mephyston/metacult/commit/a3cf459))
- **infra:** add db connection timeout (5s) to enable infinite hang prevention and allow retries ([e0ce08a](https://github.com/mephyston/metacult/commit/e0ce08a))
- **infra:** allow disabling db ssl via DB_SSL=false for private networks ([66e3634](https://github.com/mephyston/metacult/commit/66e3634))
- **infra:** auto-disable db ssl for railway internal urls to prevent timeouts ([0c93e24](https://github.com/mephyston/metacult/commit/0c93e24))
- **infra:** remove db connection timeout causing premature termination on slow boot ([42ac19d](https://github.com/mephyston/metacult/commit/42ac19d))
- **nuxt:** disable page transitions to reduce FOUC ([6533b43](https://github.com/mephyston/metacult/commit/6533b43))
- **nx:** correct module boundaries tags for Identity and Infrastructure ([f5481d6](https://github.com/mephyston/metacult/commit/f5481d6))
- **nx:** correct module boundaries tags and remove cross-boundary exports ([5338b83](https://github.com/mephyston/metacult/commit/5338b83))
- **nx:** move release.git configuration to top level ([89d64ee](https://github.com/mephyston/metacult/commit/89d64ee))
- **ops:** ensure commit sha propogates to frontend builds ([fafd956](https://github.com/mephyston/metacult/commit/fafd956))
- **pipeline:** install playwright browsers for e2e tests ([17f76a5](https://github.com/mephyston/metacult/commit/17f76a5))
- **railway:** API ne rebuild plus sur changements UI ([eeb6964](https://github.com/mephyston/metacult/commit/eeb6964))
- **ranking:** correct rank calculation to start at 1 ([24f11d3](https://github.com/mephyston/metacult/commit/24f11d3))
- **shared-ui:** ensure api url has protocol in auth client ([c2300f8](https://github.com/mephyston/metacult/commit/c2300f8))
- **shared-ui:** sync cookiePrefix with backend configuration ([cee1be8](https://github.com/mephyston/metacult/commit/cee1be8))
- **shared-ui:** replace ClientOnly with isMounted and add debug logs ([cd3c643](https://github.com/mephyston/metacult/commit/cd3c643))
- **styles:** add inline style fallback for avatar background ([3ef72ec](https://github.com/mephyston/metacult/commit/3ef72ec))
- **swipe:** résolution bug décalage desktop SwipeCard ([26035fd](https://github.com/mephyston/metacult/commit/26035fd))
- **test:** correct typescript errors and assertion logic in http.client.spec.ts ([46a6ea1](https://github.com/mephyston/metacult/commit/46a6ea1))
- **test:** upgrade RedisMock for BullMQ compatibility (EventEmitter, info, scripts) ([bc36a69](https://github.com/mephyston/metacult/commit/bc36a69))
- **test:** preload test setup for infrastructure, catalog and marketing ([fc6bac9](https://github.com/mephyston/metacult/commit/fc6bac9))
- **tests:** resolve test failures after i18n migration ([836cba3](https://github.com/mephyston/metacult/commit/836cba3))
- **tests:** standardize @metacult/backend-identity mocks to eliminate test interference ([f812db3](https://github.com/mephyston/metacult/commit/f812db3))
- **tests:** prevent BetterAuth URL validation error with smart configService mock ([1dd1e4d](https://github.com/mephyston/metacult/commit/1dd1e4d))
- **types:** add @ts-ignore for Nuxt auto-imports to resolve TypeScript errors ([7e98ee4](https://github.com/mephyston/metacult/commit/7e98ee4))
- **types:** resolve TypeScript errors in useApiUrl and register.vue ([c5a697e](https://github.com/mephyston/metacult/commit/c5a697e))
- **ui:** remove garbage code in Hero.vue props definition ([d35d2f2](https://github.com/mephyston/metacult/commit/d35d2f2))
- **ui:** enforce https protocol on client-side api url ([6de4bcb](https://github.com/mephyston/metacult/commit/6de4bcb))
- **ui:** prevent FOUC by checking theme script inline in head ([026145d](https://github.com/mephyston/metacult/commit/026145d))
- **ui:** remove CSS conflict between inline-block and flex in Hero.vue ([01fd1ce](https://github.com/mephyston/metacult/commit/01fd1ce))
- **ui:** ensure webapp url has https protocol ([108d3ac](https://github.com/mephyston/metacult/commit/108d3ac))
- **ui:** restore missing variable declaration in utils ([9f33cc2](https://github.com/mephyston/metacult/commit/9f33cc2))
- **ui:** add domain inference to getApiUrl for robust staging/prod detection ([c88a479](https://github.com/mephyston/metacult/commit/c88a479))
- **ui:** correct import path for utils in Search component ([13693a4](https://github.com/mephyston/metacult/commit/13693a4))
- **webapp:** resolve hydration mismatch with ClientOnly and update runtime config ([7fe5c59](https://github.com/mephyston/metacult/commit/7fe5c59))
- **webapp:** correct trends links to use catalog/type/slug structure ([4bf99b7](https://github.com/mephyston/metacult/commit/4bf99b7))
- **webapp:** use shared getApiUrl for auth client (fix localhost error on staging) ([63d6af3](https://github.com/mephyston/metacult/commit/63d6af3))
- **webapp:** replace hardcoded localhost defaults with shared getApiUrl for API calls ([5cf8bd5](https://github.com/mephyston/metacult/commit/5cf8bd5))
- **webapp:** resolve eslint warnings (any type, unused vars) ([3a43aa8](https://github.com/mephyston/metacult/commit/3a43aa8))
- **webapp:** simplify eslint config to prevent .nuxt recursion crash ([b379732](https://github.com/mephyston/metacult/commit/b379732))
- **webapp:** remove duplicate fr.json locale file ([afb0c96](https://github.com/mephyston/metacult/commit/afb0c96))
- **webapp:** correct i18n langDir path for build ([c42a888](https://github.com/mephyston/metacult/commit/c42a888))
- **webapp:** use absolute path for i18n langDir ([de37484](https://github.com/mephyston/metacult/commit/de37484))
- **webapp:** remove langDir and use full path in locales.file ([8696e21](https://github.com/mephyston/metacult/commit/8696e21))
- **webapp:** correct i18n langDir path resolution ([22bf706](https://github.com/mephyston/metacult/commit/22bf706))
- **website:** switch docker to bun ssr instead of nginx ([6e46735](https://github.com/mephyston/metacult/commit/6e46735))
- **website:** use dynamic port for railway deployment ([ec67bf4](https://github.com/mephyston/metacult/commit/ec67bf4))
- **website:** ensure astro config respects env PORT ([9794337](https://github.com/mephyston/metacult/commit/9794337))
- **website:** add missing vue dependency explicitly ([13519c5](https://github.com/mephyston/metacult/commit/13519c5))
- **website:** copy node_modules to release stage to fix missing deps ([ffb757c](https://github.com/mephyston/metacult/commit/ffb757c))
- **website:** use internal api url for ssr fetch ([ced441e](https://github.com/mephyston/metacult/commit/ced441e))
- **website:** standardize api vars and remove hardcoded localhost ([6ce2434](https://github.com/mephyston/metacult/commit/6ce2434))
- **website:** inject PUBLIC_API_URL build arg for client-side hydration ([7468aa0](https://github.com/mephyston/metacult/commit/7468aa0))
- **website:** use process.env for runtime api url resolution ([058fb5a](https://github.com/mephyston/metacult/commit/058fb5a))
- **website:** add sharp dependency for astro image optimization ([4510851](https://github.com/mephyston/metacult/commit/4510851))
- **website:** normalize api url protocol to support raw domain env vars ([0bbf592](https://github.com/mephyston/metacult/commit/0bbf592))
- **website:** switch to debian-based bun image to support sharp/native modules ([2d5fdaf](https://github.com/mephyston/metacult/commit/2d5fdaf))
- **website:** allow internal http api calls and ensure sharp dependency ([d97f2e6](https://github.com/mephyston/metacult/commit/d97f2e6))
- **website:** force http protocol for internal railway domains ([a08f2b1](https://github.com/mephyston/metacult/commit/a08f2b1))
- **website:** use node-slim for image stability and force port 3000 for internal api ([b9f42f3](https://github.com/mephyston/metacult/commit/b9f42f3))
- **website:** rebuild sharp in release stage and aid debug logs ([a744262](https://github.com/mephyston/metacult/commit/a744262))
- **website:** revert to SSG (nginx) to match production stability ([def3b43](https://github.com/mephyston/metacult/commit/def3b43))
- **website:** RETRY restore SSR and fix networking (git lock collision) ([606b673](https://github.com/mephyston/metacult/commit/606b673))
- **website:** use port 8080 for internal railway api connection ([e6fcb50](https://github.com/mephyston/metacult/commit/e6fcb50))
- **website:** resolve compilation errors in index.astro ([6ffc13c](https://github.com/mephyston/metacult/commit/6ffc13c))
- **website:** cleanup lint errors in index.astro (duplicated imports and unused vars) ([52bacb8](https://github.com/mephyston/metacult/commit/52bacb8))
- **website:** deduplicate imports and logic in index.astro ([b1b9e42](https://github.com/mephyston/metacult/commit/b1b9e42))
- **website:** use static hero image to bypass astro image optimization 500 error ([364335f](https://github.com/mephyston/metacult/commit/364335f))
- **website:** correct syntax errors in Hero.vue and index.astro ([3282a5b](https://github.com/mephyston/metacult/commit/3282a5b))
- **website:** bundle better-auth and vueuse to resolve vue dep in SSR ([5c22550](https://github.com/mephyston/metacult/commit/5c22550))
- **website:** inject runtime env vars via window.__ENV__ for client hydration ([9584920](https://github.com/mephyston/metacult/commit/9584920))
- **website:** use shared getApiUrl to align SSR/Client logic & remove phantom internal URL ([06eaf14](https://github.com/mephyston/metacult/commit/06eaf14))
- **website:** provide labels to Header component to prevent crash ([bfd657e](https://github.com/mephyston/metacult/commit/bfd657e))
- **website:** use process.env for commit sha ([27c49c2](https://github.com/mephyston/metacult/commit/27c49c2))
- **worker:** satisfy module boundaries and fix race condition in tests ([60a8acf](https://github.com/mephyston/metacult/commit/60a8acf))
- **worker:** switch to debian base image for stability ([c8fee3d](https://github.com/mephyston/metacult/commit/c8fee3d))

### ⚠️  Breaking Changes

- implement structured logging & error handling  ([26ed946](https://github.com/mephyston/metacult/commit/26ed946))
  Console logs are now structured JSON in production

### ❤️ Thank You

- David PAGNACCO