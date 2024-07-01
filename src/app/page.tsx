import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import HomepagePage from '@/app/HomepagePage';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Home',
    description: 'Jill Weeks Smith Home Page',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Biographical, Biography',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Homepage',
        description: 'Visit the JWS Fine Art Gallery',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: [
            {
                url: '/favicon/og-image.png',
                width: 1200,
                height: 630,
                alt: 'JWS Fine Art',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
};

export default async function Page() {

    return (
        <PageLayout page="/">
            <Suspense fallback={<HomepageSkeleton />}>
                <HomepagePage />
            </Suspense>
        </PageLayout>
    );
}

const HomepageSkeleton = () => {
    return (
        <div className="relative flex h-full w-full flex-col space-y-2">
            <div className="absolute inset-0 h-full animate-pulse bg-stone-900"></div>
        </div>
    );
};

export const revalidate = 60;
