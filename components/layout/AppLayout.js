'use client'

import React from 'react';
import ScriptLoader from '@/components/wrappers/ScriptLoader';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useAppContext } from '@/contexts/AppContext';
import { useAnalytics } from '@/lib/useAnalytics';

import { useUser } from "@clerk/clerk-react";
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';

import '@/styles/globals/globals.scss';
import 'typeface-lato';

const ADMIN_PAGES = new Set(['/edit/[id]', '/manage', '/admin', '/orders']);

const AppLayout = ({children}) => {
    const { appState, setAppState } = useAppContext();

    const pathname = usePathname();
    const isPrivatePath = ADMIN_PAGES.has(pathname);
    console.log(`pathname: ${pathname} | isPrivatePath: ${isPrivatePath}`);

    const { isLoaded, isSignedIn, user } = useUser();
    
    useAnalytics();
    
    // console.log("AppLayout appState:", appState);
    useEffect(() => {
        setAppState(prevState => ({
            ...prevState, 
            pathname: pathname, 
            isLoaded: isLoaded, 
            isSignedIn: isSignedIn, 
            user: user,
            theme: 'None',
        }));
    }, [pathname, isLoaded, isSignedIn, user]);

    return (
        <>
            <html lang="en" >
            <ScriptLoader />
                <body>
                    {isPrivatePath ? (
                        <>
                            <SignedIn>
                                {children}
                            </SignedIn>
                            <SignedOut>
                                <RedirectToSignIn />
                            </SignedOut>
                        </>
                    ) : (
                        <>
                            {children}
                        </>
                    )}
                </body>
            </html>
        </>
    );
}

export default AppLayout;
