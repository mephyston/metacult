import type { Config } from 'tailwindcss';
import sharedPreset from '@metacult/shared-ui/styles/tailwind.preset.mjs';

export default {
    presets: [sharedPreset],
    content: [
        './app.vue',
        './app/**/*.{vue,js,ts,jsx,tsx}',
        './pages/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}',
        './layouts/**/*.{vue,js,ts,jsx,tsx}',
        // Shared UI
        '../../libs/shared/ui/src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;
