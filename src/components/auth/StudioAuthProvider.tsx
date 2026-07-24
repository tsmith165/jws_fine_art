import React from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

// Clerk's browser bundle is heavy, so only the sign-in/sign-out routes mount
// this provider. Server-side auth() everywhere else needs only the proxy
// middleware, not the provider.
export function StudioAuthProvider({ children }: { children: React.ReactNode }) {
    return (
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
            {children}
        </ClerkProvider>
    );
}
