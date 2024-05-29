import { Metadata } from 'next';
import { Pieces } from '@/db/schema';
import { fetchPieces } from '@/app/actions';
import React from 'react';
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

export default function Page() {
    const piecesPromise = fetchPiecesData();

    return (
        <PageLayout page="/gallery">
            <Gallery piecesPromise={piecesPromise} />
        </PageLayout>
    );
}

export const revalidate = 60;
