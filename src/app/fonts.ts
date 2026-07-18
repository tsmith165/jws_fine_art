import { Cinzel, Libre_Caslon_Text, Manrope } from 'next/font/google';

export const cinzel = Cinzel({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800', '900'], // Cinzel is available in weights 400 to 900
    variable: '--font-cinzel-face',
    display: 'swap',
});

export const libreCaslon = Libre_Caslon_Text({
    subsets: ['latin'],
    weight: ['400', '700'],
    variable: '--font-lit-display',
    display: 'swap',
});

export const manrope = Manrope({
    subsets: ['latin'],
    variable: '--font-lit-body',
    display: 'swap',
});
