import React from 'react';
import 'tailwindcss/tailwind.css';
import '@/styles/globals.scss';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { PHProvider } from './providers'

import { cinzel } from './fonts';

interface RootLayoutProps {
    children: React.ReactNode;
    params: any;
}

export default function RootLayout({ children, params }: RootLayoutProps) {
    return (
        <html lang="en" className={`${cinzel.variable}`}>
            <PHProvider>
                <body className="font-cinzel">
                    <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
                    <SpeedInsights />
                </body>
            </PHProvider>
        </html>
    );
}
