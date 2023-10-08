import React from 'react';

import { AppProvider } from '@/contexts/AppContext';
import AppLayout from '@/components/layout/AppLayout';
import '@/styles/globals/globals.scss';
import { useRouter } from 'next/navigation';


import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function RootLayout({children, params }) {
    console.log(`Loading Root Layout...`)

    return (
        <>
            <AppProvider>
                <ClerkProvider appearance={{ baseTheme: dark }} frontendApi={{ apiKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}>
                    <AppLayout>
                        {children}
                    </AppLayout>
                </ClerkProvider>
            </AppProvider>
        </>
    );
}