/** @type {import('tailwindcss').Config} */
/** @type {import('tailwindcss').Config} */
import sharedPreset from '../../libs/shared/ui/src/styles/tailwind.preset.mjs';

export default {
    presets: [sharedPreset],
    content: [
        './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
        // Shared UI
        '../../libs/shared/ui/src/**/*.{vue,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};
