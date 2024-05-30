import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Edit Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: '/og-image.png',
    },
};

import { fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/edit/[id]/Edit';
import { SignedIn } from '@clerk/nextjs';
import React, { Suspense } from 'react';
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

export default function Page({ params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    const pieceDataPromise = usePieceData(id);

    return (
        <PageLayout page={`/edit/${id}`}>
            <SignedIn>
                <Suspense fallback={<LoadingSpinner page="Edit" />}>
                    <Edit pieceDataPromise={pieceDataPromise} current_id={id} />
                </Suspense>
            </SignedIn>
        </PageLayout>
    );
}
