import React, { Suspense } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { PHProvider } from './providers';
import { SpeedInsights } from '@vercel/speed-insights/next';

import '@/styles/globals.css';
import '@/styles/lit-wall.css';
import '@/styles/owner-console.css';

import { cinzel, libreCaslon, manrope } from './fonts';
import PostHogPageView from './PostHogPageView';

export const metadata = {
    metadataBase: new URL('https://www.jwsfineart.com'),
    title: {
        default: 'Jill Weeks Smith Fine Art',
        template: '%s | Jill Weeks Smith Fine Art',
    },
    description: 'Original oil paintings, pastels, and prints by San Diego artist Jill Weeks Smith.',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
};

interface RootLayoutProps {
    children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
    const isVercelRuntime = process.env.VERCEL === '1';

    return (
        <html lang="en" className={`${cinzel.variable} ${libreCaslon.variable} ${manrope.variable}`}>
            <body>
                <ClerkProvider
                    appearance={{
                        baseTheme: dark,
                        elements: {
                            formButtonPrimary: {
                                backgroundColor: '#c6a466',
                                color: '#17140f',
                            },
                        },
                    }}
                >
                    <PHProvider>
                        <Suspense fallback={null}>
                            <PostHogPageView />
                        </Suspense>
                        {isVercelRuntime ? <SpeedInsights /> : null}
                        {children}
                    </PHProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
