import { redirect } from 'next/navigation';
import { fetchFirstPieceId, fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/edit/[id]/Edit';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

async function fetchPieceData(id: number) {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);
    return { ...piece, next_id, last_id };
}

const pieceDataCache: { [key: number]: Promise<any> } = {};

function usePieceData(id: number) {
    if (!pieceDataCache[id]) {
        pieceDataCache[id] = fetchPieceData(id);
    }
    return pieceDataCache[id];
}

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
        icons: {
            icon: '/JWS_ICON_MAIN.png',
        },
        openGraph: {
            images: '/og-image.png',
        },
    };
}

export default async function Page({ params, searchParams }: PageProps) {
    const firstId = await fetchFirstPieceId();

    if (!firstId) {
        return <div>No pieces available.</div>;
    }

    const pieceDataPromise = usePieceData(firstId);
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/edit/${firstId}`}>
            <Suspense fallback={<LoadingSpinner page="Edit Details" />}>
                <Edit pieceDataPromise={pieceDataPromise} current_id={firstId} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
