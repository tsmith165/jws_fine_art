import React from 'react';
import 'tailwindcss/tailwind.css';
import '@/styles/globals/globals.scss';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JWS Fine Art',
    description: 'Jill Weeks Smith',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

interface RootLayoutProps {
    children: React.ReactNode;
    params: any;
}

export default function RootLayout({ children, params }: RootLayoutProps) {
    console.log(`Loading Root Layout...`);

    return (
        <html lang="en">
            <body>
                <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
            </body>
        </html>
    );
}
