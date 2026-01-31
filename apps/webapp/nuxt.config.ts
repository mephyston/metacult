import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

import { themeScript } from '../../libs/shared/ui/src/lib/theme-script';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  workspaceDir: '../../',
  srcDir: 'app',
  devtools: { enabled: true },
  ssr: false, // SPA mode - pas besoin de SSR pour une app authentifiée
  devServer: {
    host: 'localhost',
    port: 4201,
  },
  modules: ['@nuxtjs/i18n', '@nuxtjs/google-fonts', '@vite-pwa/nuxt'],

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Metacult',
      short_name: 'Metacult',
      theme_color: '#09090b',
      background_color: '#09090b',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      runtimeCaching: [
        {
          // Cache Google Books Images
          urlPattern: /^https:\/\/books\.google\.com\/books\/.*$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-books-cache',
            expiration: {
              maxEntries: 500,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Cache IGDB Images (images.igdb.com)
          urlPattern: /^https:\/\/images\.igdb\.com\/.*$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'igdb-images-cache',
            expiration: {
              maxEntries: 500,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 1 Year
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          // Cache Placeholder Images
          urlPattern: /^https:\/\/placehold\.co\/.*$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'placeholder-cache',
            expiration: {
              maxEntries: 20,
              maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
    },
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fr',
    locales: [{ code: 'fr', file: 'fr.json' }],
    lazy: true,
    langDir: '../app/locales',
  },
  app: {
    // google-fonts handles the font links now
    head: {
      script: [
        {
          innerHTML: themeScript,
        },
      ],
    },
    pageTransition: false,
    layoutTransition: false,
  },
  runtimeConfig: {
    // Private keys (Server-side only)
    internalApiUrl: '', // Surchargé par NUXT_INTERNAL_API_URL
    public: {
      // Public keys (Client-side)
      apiUrl: '', // Surchargé par NUXT_PUBLIC_API_URL (MANDATORY)
      authUrl: '', // Surchargé par NUXT_PUBLIC_AUTH_URL
      authCookiePrefix: 'metacult', // Surchargé par NUXT_PUBLIC_AUTH_COOKIE_PREFIX
      websiteUrl: '', // Surchargé par NUXT_PUBLIC_WEBSITE_URL
      webappUrl: '', // Surchargé par NUXT_PUBLIC_WEBAPP_URL
      commitSha:
        process.env.GIT_SHA || process.env.RAILWAY_GIT_COMMIT_SHA || '',
      appVersion: process.env.NUXT_PUBLIC_APP_VERSION || '',
    },
  },
  typescript: {
    typeCheck: false,
    tsConfig: {
      extends: '../../../tsconfig.json',
    },
  },
  imports: {
    autoImport: true,
  },
  router: {
    options: {
      // Enable global middleware
    },
  },
  css: ['../../libs/shared/ui/src/styles/global.css'],
  vite: {
    plugins: [nxViteTsPaths(), tailwindcss()],
    build: {
      target: 'esnext',
    },
  },
  build: {
    transpile: ['@metacult/shared-core', '@metacult/shared-ui'],
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
    // NOTE: API proxy is now handled by server/api/[...].ts for runtime env var support
  },
  googleFonts: {
    families: {
      Roboto: [300, 400, 500, 700],
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
  },
  alias: {
    '@metacult/shared-core': fileURLToPath(
      new URL('../../libs/shared/core/src/index.ts', import.meta.url),
    ),
    '@metacult/shared-ui': fileURLToPath(
      new URL('../../libs/shared/ui/src/index.ts', import.meta.url),
    ),
    '@metacult/shared-types': fileURLToPath(
      new URL('../../libs/shared/types/src/index.ts', import.meta.url),
    ),
    '@metacult/shared-local-db': fileURLToPath(
      new URL('../../libs/shared/local-db/src/index.ts', import.meta.url),
    ),
    '@metacult/shared-sync-manager': fileURLToPath(
      new URL('../../libs/shared/sync-manager/src/index.ts', import.meta.url),
    ),
    '@metacult/api': fileURLToPath(
      new URL('../../apps/api/index.ts', import.meta.url),
    ),
    '@metacult/backend-catalog': fileURLToPath(
      new URL('../../libs/backend/catalog/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-discovery': fileURLToPath(
      new URL('../../libs/backend/discovery/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-identity': fileURLToPath(
      new URL('../../libs/backend/identity/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-interaction': fileURLToPath(
      new URL('../../libs/backend/interaction/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-ranking': fileURLToPath(
      new URL('../../libs/backend/ranking/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-gamification': fileURLToPath(
      new URL('../../libs/backend/gamification/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-infrastructure': fileURLToPath(
      new URL('../../libs/backend/infrastructure/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-commerce': fileURLToPath(
      new URL('../../libs/backend/commerce/src/index.ts', import.meta.url),
    ),
    '@metacult/backend-marketing': fileURLToPath(
      new URL('../../libs/backend/marketing/src/index.ts', import.meta.url),
    ),
  },
};
