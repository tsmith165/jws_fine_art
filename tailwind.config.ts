import typography from '@tailwindcss/typography';

import { withUt } from 'uploadthing/tw';

export default withUt({
    content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                alegrya: ['Alegreya Sans SC', 'sans-serif'],
                lato: ['Lato', 'sans-serif'],
                cinzel: ['var(--font-cinzel)', 'serif'], // Fixed typo and using CSS variable
            },
            colors: {
                primary: '#54786d',
                primary_dark: '#365349',
                secondary_light: '#616c63',
                secondary: '#475451',
                secondary_dark: '#333739',

                link: '#57aaf3', // unvisited link color,
                visited: '#be23ae', // visited link color
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
    plugins: [typography],
});
