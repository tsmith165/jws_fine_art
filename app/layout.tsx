import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import 'tailwindcss/tailwind.css';
import '@/styles/globals/globals.scss';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

interface RootLayoutProps {
  children: React.ReactNode;
  params: any;
}

export default function RootLayout({ children, params }: RootLayoutProps) {
  console.log(`Loading Root Layout...`);

  return (
    <>
      <AppProvider>
        <ClerkProvider
          appearance={{ baseTheme: dark }}
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
        >
          <html lang="en">{children}</html>
        </ClerkProvider>
      </AppProvider>
    </>
  );
}