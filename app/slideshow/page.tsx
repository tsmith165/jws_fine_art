import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import PageLayout from '@/components/layout/PageLayout';
import Slideshow from '@/app/slideshow/Slideshow';
import { fetchPieces } from '@/app/actions';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery Slideshow',
    description: 'Gallery slideshow for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Slideshow',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.jpg',
        shortcut: '/JWS_ICON_MAIN.jpg',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Slideshow',
        description: 'Slideshow for JWS Fine Art',
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

export default function Page() {
    const pieceListPromise = fetchPieces();

    return (
        <PageLayout page="/slideshow">
            <Suspense fallback={<LoadingSpinner page="Slideshow" />}>
                <Slideshow pieceListPromise={pieceListPromise} />
            </Suspense>
        </PageLayout>
    );
}
