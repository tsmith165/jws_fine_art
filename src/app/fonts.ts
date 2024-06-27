import { Cinzel } from 'next/font/google';

export const cinzel = Cinzel({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'], // Cinzel is available in weights 400 to 900
    variable: '--font-cinzel',
    display: 'swap',
});
