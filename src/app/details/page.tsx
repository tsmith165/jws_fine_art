import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery Piece Details',
    description: 'View gallery piece details for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Piece Details',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Piece Details',
        description: 'Piece Details for JWS Fine Art',
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

import { fetchFirstPieceId, fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { PiecesWithImages } from '@/db/schema';

async function fetchPieceData(id: number): Promise<PiecesWithImages> {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);
    return { ...piece, next_id, last_id };
}

export default async function Page(props: { searchParams: Promise<{ id?: string; selected?: string; type?: string }> }) {
    const searchParams = await props.searchParams;
    const firstId = await fetchFirstPieceId();

    if (!firstId) {
        return <div>No pieces available.</div>;
    }

    const pieceData = await fetchPieceData(firstId);
    const selectedIndex = searchParams.selected ? parseInt(searchParams.selected, 10) : 0;
    const type = searchParams.type || 'gallery';

    return (
        <PageLayout page={`/details/${firstId}`}>
            <Suspense fallback={<LoadingSpinner page="Details" />}>
                <Details pieceData={pieceData} selectedIndex={selectedIndex} type={type} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
