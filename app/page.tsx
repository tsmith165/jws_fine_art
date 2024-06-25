import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import HomepagePage from '@/app/HomepagePage';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Biography',
    description: 'Jill Weeks Smith Biography',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Biographical, Biography',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
        shortcut: '/JWS_ICON_MAIN.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Biography',
        description: 'Biography for JWS Fine Art',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: [
            {
                url: '/og-image.png',
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
            <div className="absolute inset-0 h-full animate-pulse bg-gray-300"></div>
            <div className="absolute bottom-0 flex h-[50px] w-full items-center justify-center space-x-4">
                <div className="rounded-lg bg-gray-400 p-1">
                    <div className="h-6 w-6 animate-pulse"></div>
                </div>
                {Array.from({ length: 7 }).map((_, index) => (
                    <div key={index} className={`h-4 w-4 animate-pulse rounded-full bg-gray-400`}></div>
                ))}
                <div className="rounded-lg bg-gray-400 p-1">
                    <div className="h-6 w-6 animate-pulse"></div>
                </div>
            </div>
        </div>
    );
};

export const revalidate = 60;
