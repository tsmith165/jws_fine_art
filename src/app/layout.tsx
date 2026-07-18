import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { PHProvider } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { dark } from '@clerk/themes';

import '@/styles/globals.css';

import { cinzel } from './fonts';

export const metadata = {
    metadataBase: new URL('https://www.jwsfineart.com'),
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <html lang="en" className={`${cinzel.variable}`}>
                <body className="font-cinzel">
                    <PHProvider>
                        <SpeedInsights />
                        {children}
                    </PHProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
