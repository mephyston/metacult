// @ts-check
// Force Railway Rebuild
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import path from 'path';
import { fileURLToPath } from 'url';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isProduction = process.env.NODE_ENV === 'production';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone'
    }),
    integrations: [
        vue()
    ],
    image: {
        domains: ['images.unsplash.com', 'images.igdb.com', 'image.tmdb.org'],
    },
    vite: {
        envDir: path.resolve(__dirname, '../..'), // Charge .env depuis la racine du monorepo
        plugins: [nxViteTsPaths(), tailwindcss()],
        ssr: {
            noExternal: isProduction
                ? ['@metacult/shared-ui', 'radix-vue', 'lucide-vue-next', 'vue', '@astrojs/vue', 'better-auth', '@vueuse/core']
                : ['@metacult/shared-ui', 'radix-vue', 'lucide-vue-next', 'better-auth', '@vueuse/core'],
        },
        optimizeDeps: {
            include: ['vue', 'radix-vue', 'lucide-vue-next', 'class-variance-authority', 'clsx', 'tailwind-merge'],
            exclude: ['@metacult/shared-ui']
        },
        resolve: {
            dedupe: ['vue'],
            alias: {
                '@metacult/shared-ui/styles': path.resolve(__dirname, '../../libs/shared/ui/src/styles'),
            },
        },
    },
    server: {
        port: process.env.PORT ? Number(process.env.PORT) : 8085,
        host: true
    },
});
// Trigger deploy: 2026-01-03-force-rebuild-website-hero-fix
