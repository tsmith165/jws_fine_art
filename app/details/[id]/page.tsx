import { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import { PiecesWithImages } from '@/db/schema';

interface PageProps {
    params: {
        id: string;
    };
    searchParams?: {
        selected?: string;
        type?: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: 'JWS Fine Art - Gallery Piece Details',
        description: 'View gallery piece details for JWS Fine Art',
        keywords:
            'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Piece Details',
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
    const { id: idParam } = params;
    const id = parseInt(idParam, 10);
    const pieceDataPromise = usePieceData(id);
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/details/${id}`}>
            <Suspense fallback={<LoadingSpinner page="Details" />}>
                <Details pieceDataPromise={pieceDataPromise} selectedIndex={selectedIndex} type={type} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
