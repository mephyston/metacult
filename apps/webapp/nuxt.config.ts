import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { defineNuxtConfig } from 'nuxt/config';

import { themeScript } from '../../libs/shared/ui/src/lib/theme-script';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  workspaceDir: '../../',
  srcDir: 'app',
  devtools: { enabled: true },
  devServer: {
    host: 'localhost',
    port: 4201,
  },
  app: {
    // google-fonts handles the font links now
    head: {
      script: [
        {
          innerHTML: themeScript
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      // Utilise PUBLIC_API_URL (même variable qu'Astro)
      apiUrl: process.env.PUBLIC_API_URL || 'http://localhost:3000',
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
  css: ['@metacult/shared-ui/styles/global.css'],
  vite: {
    plugins: [nxViteTsPaths(), tailwindcss()],
    build: {
      target: 'esnext',
    },
  },
  build: {
    transpile: ['@metacult/shared-ui'],
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext',
      },
    },
  },
  modules: ['@nuxtjs/google-fonts'],
  // @ts-expect-error: googleFonts property is added by the module but types are not inferred without build
  googleFonts: {
    families: {
      Roboto: [300, 400, 500, 700],
    },
    display: 'swap',
    prefetch: true,
    preconnect: true,
  },
  alias: {
    '@metacult/shared-ui/styles': fileURLToPath(new URL('../../libs/shared/ui/src/styles', import.meta.url)),
    '@metacult/shared-ui': fileURLToPath(new URL('../../libs/shared/ui/src/index.ts', import.meta.url)),
  },
});
