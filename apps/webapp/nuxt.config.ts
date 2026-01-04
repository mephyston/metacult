/* eslint-disable @nx/enforce-module-boundaries */
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
  modules: ['@nuxtjs/i18n', '@nuxtjs/google-fonts'],
  // @ts-ignore - i18n module config types not available until build
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'fr',
    locales: [{ code: 'fr', file: 'fr.json' }],
    lazy: true,
    langDir: 'app/locales', // Chemin relatif à la racine du projet (pas au srcDir)
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
    routeRules: {
      '/api/**': { proxy: 'http://localhost:3000/api/**' },
    },
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
  },
};
