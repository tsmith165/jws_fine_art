import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import type { ReactNode } from 'react';

export default function SignInLayout({ children }: { children: ReactNode }) {
    return <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>;
}
