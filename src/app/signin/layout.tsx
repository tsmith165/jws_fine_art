import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { ReactNode } from 'react';

export default function SignInLayout({ children }: { children: ReactNode }) {
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
