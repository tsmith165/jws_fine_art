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
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Masonry',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
        shortcut: '/JWS_ICON_MAIN.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Gallery',
        description: 'Gallery for JWS Fine Art',
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

async function fetchPiecesData(): Promise<Pieces[]> {
    const pieces = fetchPieces();
    return pieces;
}

export default async function Page() {
    const piecesData = await fetchPiecesData();

    return (
        <PageLayout page="/gallery">
            <Gallery pieces={piecesData} />
        </PageLayout>
    );
}

export const revalidate = 60;
