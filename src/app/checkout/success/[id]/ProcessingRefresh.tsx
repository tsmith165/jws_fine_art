'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ProcessingRefresh() {
    const router = useRouter();

    useEffect(() => {
        let attempts = 0;
        const interval = window.setInterval(() => {
            attempts += 1;
            router.refresh();
            if (attempts >= 15) window.clearInterval(interval);
        }, 2000);
        return () => window.clearInterval(interval);
    }, [router]);

    return null;
}
