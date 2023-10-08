'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as gtag from './gtag';

export const useAnalytics = () => {
    console.log('Generating analytics hook...')
    const router = useRouter();

    useEffect(() => {
        // Check if router is defined and has events attached
        if (router && router.events) {
            const handleRouteChange = (url) => {
                gtag.pageview(url);
            };

            // Handle route changes for analytics
            router.events.on('routeChangeComplete', handleRouteChange);
            
            // Clean up the listener when the component is unmounted
            return () => {
                router.events.off('routeChangeComplete', handleRouteChange);
            };
        }
    }, [router]);
};
