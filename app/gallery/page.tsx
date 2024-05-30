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
};

async function fetchPiecesData(): Promise<Pieces[]> {
    const pieces = fetchPieces();
    return pieces;
}

export default function Page() {
    const piecesData = fetchPiecesData();

    return (
        <PageLayout page="/gallery">
            <Suspense fallback={<LoadingSpinner page="Gallery" />}>
                <Gallery piecesData={piecesData} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
