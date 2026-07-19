'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { capturePageview } from '@/lib/analytics';

export default function PostHogPageView(): null {
    const pathname = usePathname();
    useEffect(() => {
        if (pathname) capturePageview();
    }, [pathname]);

    return null;
}
