// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vue from '@astrojs/vue';
import path from 'path';
import { fileURLToPath } from 'url';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
    integrations: [
        tailwind(),
        vue()
    ],
    vite: {
        plugins: [nxViteTsPaths()],
        ssr: {
            noExternal: ['@metacult/shared-ui', 'radix-vue', 'lucide-vue-next'],
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
        port: 8085,
    },
});
