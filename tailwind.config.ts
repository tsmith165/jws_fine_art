import typography from '@tailwindcss/typography';
const plugin = require('tailwindcss/plugin');
import { withUt } from 'uploadthing/tw';

export default withUt({
    content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                alegrya: ['Alegreya Sans SC', 'sans-serif'],
                lato: ['Lato', 'sans-serif'],
                cinzel: ['var(--font-cinzel)', 'serif'],
            },
            colors: {
                primary: '#54786d',
                primary_dark: '#365349',
                secondary_light: '#616c63',
                secondary: '#475451',
                secondary_dark: '#333739',

                link: '#57aaf3',
                visited: '#be23ae',
            },
            screens: {
                xxxs: '325px',
                xxs: '375px',
                xs: '480px',
                'md-nav': '833px',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            animation: {
                fadeIn: 'fadeIn 1s forwards',
                'fade-out': 'fadeOut 2s ease-in',
            },
        },
    },
    mode: 'jit',
    plugins: [
        typography,
        plugin(function ({ addBase, theme, addUtilities }: { addBase: any; theme: any; addUtilities: any }) {
            addBase({
                ':root': {
                    '--color-primary': theme('colors.primary'),
                    '--color-primary-dark': theme('colors.primary_dark'),
                    '--color-secondary-light': theme('colors.secondary_light'),
                    '--color-secondary': theme('colors.secondary'),
                    '--color-secondary-dark': theme('colors.secondary_dark'),
                },
            });

            // Custom gradeint utility classes
            const newUtilities = {
                '.gradient-primary-main': {
                    '@apply text-transparent bg-gradient-to-r bg-clip-text bg-gradient-to-r from-primary via-primary_dark to-primary': {},
                },
            };

            addUtilities(newUtilities);
        }),
    ],
});
