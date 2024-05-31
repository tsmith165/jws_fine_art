import { redirect } from 'next/navigation';
import { fetchFirstPieceId, fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { PiecesWithImages } from '@/db/schema';

interface PageProps {
    params: {
        id?: string;
    };
    searchParams?: {
        selected?: string;
        type?: string;
    };
}

export async function generateMetadata({ params }: PageProps) {
    return {
        title: 'JWS Fine Art - Gallery Piece Details',
        description: 'View gallery piece details for JWS Fine Art',
        keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Piece Details',
        applicationName: 'JWS Fine Art',
        icons: {
            icon: '/JWS_ICON_MAIN.png',
        },
        openGraph: {
            title: 'JWS Fine Art - Piece Details',
            description: 'Piece Details for JWS Fine Art',
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
}

async function fetchPieceData(id: number): Promise<PiecesWithImages> {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);
    return { ...piece, next_id, last_id };
}

const pieceDataCache: { [key: number]: Promise<PiecesWithImages> } = {};

function usePieceData(id: number) {
    if (!pieceDataCache[id]) {
        pieceDataCache[id] = fetchPieceData(id);
    }
    return pieceDataCache[id];
}

export default function Page({ params, searchParams }: PageProps) {
    const firstIdPromise = fetchFirstPieceId();
    const firstId = React.use(firstIdPromise);
    if (!firstId) {
        return <div>No pieces available.</div>;
    }

    const pieceDataPromise = usePieceData(firstId);

    return (
        <PageLayout page={`/details/${firstId}`}>
            <Suspense fallback={<LoadingSpinner page="Details" />}>
                <Details pieceDataPromise={pieceDataPromise} selectedIndex={0} type={'gallery'} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
