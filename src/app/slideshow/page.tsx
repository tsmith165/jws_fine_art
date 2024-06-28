import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import PageLayout from '@/components/layout/PageLayout';
import SlideshowPage from '@/app/slideshow/SlideshowPage';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery Slideshow',
    description: 'Gallery slideshow for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Slideshow',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Slideshow',
        description: 'Slideshow for JWS Fine Art',
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

export default function Page() {
    return (
        <PageLayout page="/slideshow">
            <Suspense
                fallback={
                    <div className="flex h-full w-full bg-stone-800">
                        <div className="flex h-[50px] w-full justify-end bg-stone-400"></div>
                    </div>
                }
            >
                <SlideshowPage />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
