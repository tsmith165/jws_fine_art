import { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Edit Gallery Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Edit',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Edit Details',
        description: 'Edit Details for JWS Fine Art',
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

import React, { Suspense } from 'react';
import { getMostRecentId, fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/admin/edit/Edit';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import { redirect } from 'next/navigation';

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

export default async function Page(props: { searchParams: Promise<{ id?: string }> }) {
    const searchParams = await props.searchParams;
    let id = searchParams.id ? parseInt(searchParams.id, 10) : null;

    if (!id) {
        // Fetch the most recent ID if no ID is provided
        const mostRecentId = await getMostRecentId();
        if (mostRecentId) {
            // Redirect to the same page with the most recent ID in the URL
            redirect(`/admin/edit?id=${mostRecentId}`);
        } else {
            return (
                <PageLayout page="/edit">
                    <div className="text-center text-xl">No pieces found</div>
                </PageLayout>
            );
        }
    }

    const pieceDataPromise = fetchPieceData(id);

    return (
        <PageLayout page={`/admin/edit?id=${id}`}>
            <Suspense fallback={<LoadingSpinner page="Edit" />}>
                <Edit pieceDataPromise={pieceDataPromise} current_id={id} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
