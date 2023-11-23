module.exports = {
    content: ['./app/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                alegrya: ['Alegreya Sans SC', 'sans-serif'],
                lato: ['Lato', 'sans-serif'],
            },
            colors: {
                light: '#616C63', // Ebony
                primary: '#54786D', // Hooker's Green
                secondary: '#365349', // Dark Slate Gray
                tertiary: '#475451', // Feldgrau

                white: '#ffffff', // white
                grey: '#4F5451', // Davy's Grey
                dark: '#333739', // Onyx
                black: '#1c1917', // stone-900

                link: '#57aaf3', // unvisited link color,
                visited: '#be23ae', // visited link color
            },
            screens: {
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
            },
            animation: {
                'fade-out': 'fadeOut 2s ease-in',
            },
        },
    },
};
