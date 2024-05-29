import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import PageLayout from '@/components/layout/PageLayout';
import Slideshow from '@/app/slideshow/Slideshow';
import { fetchPieces } from '@/app/actions';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery Slideshow',
    description: 'Gallery slideshow for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
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
