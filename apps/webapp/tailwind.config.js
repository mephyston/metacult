const sharedPreset = require('../../libs/shared/ui/src/styles/tailwind-preset.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
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
};
