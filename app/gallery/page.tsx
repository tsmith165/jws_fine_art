import { Metadata } from 'next';
import { Pieces } from '@/db/schema';
import { fetchPieces } from '@/app/actions';
import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import PageLayout from '@/components/layout/PageLayout';
import Gallery from './Gallery';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery',
    description: 'Gallery page for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

async function fetchPiecesData(): Promise<Pieces[]> {
    return await fetchPieces();
}

function GalleryWrapper({ pieces }: { pieces: Pieces[] }) {
    return <Gallery pieces={pieces} />;
}

export default async function Page() {
    const pieces = await fetchPiecesData();

    return (
        <PageLayout page="/gallery">
            <Suspense fallback={<LoadingSpinner />}>
                <GalleryWrapper pieces={pieces} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
