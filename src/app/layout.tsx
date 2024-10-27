import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { PHProvider } from './providers';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SpeedInsights } from '@vercel/speed-insights/next';

import 'tailwindcss/tailwind.css';
import '@/styles/globals.css';

import { cinzel } from './fonts';

interface RootLayoutProps {
    children: React.ReactNode;
}

const RootProvider = ({ children }: RootLayoutProps) => {
    return (
        <ClerkProvider appearance={{ baseTheme: dark }}>
            <PHProvider>
                <NuqsAdapter>{children}</NuqsAdapter>
            </PHProvider>
        </ClerkProvider>
    );
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <RootProvider>
            <html lang="en" className={`${cinzel.variable}`}>
                <body className="font-cinzel">
                    <SpeedInsights />
                    {children}
                </body>
            </html>
        </RootProvider>
    );
}
