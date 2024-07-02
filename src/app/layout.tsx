import React from 'react';
import 'tailwindcss/tailwind.css';
import '@/styles/globals.scss';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { SpeedInsights } from '@vercel/speed-insights/next';

import { PHProvider } from './providers'
import dynamic from 'next/dynamic';

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
  ssr: false,
})

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
                    <SpeedInsights />
                    <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
                </body>
            </PHProvider>
        </html>
    );
}
