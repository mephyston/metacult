// libs/shared/ui/src/styles/tailwind-preset.js
module.exports = {
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3effba', // Un vert néon signature
                    hover: '#32cc9a',
                    foreground: '#000000',
                },
                secondary: {
                    DEFAULT: '#94a3b8',
                    foreground: '#ffffff',
                },
                background: '#0f172a', // Dark mode par défaut
                surface: '#1e293b',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'],
            },
            borderRadius: {
                'lg': '0.5rem',
                'xl': '0.75rem',
            }
        },
    },
    plugins: [],
};
