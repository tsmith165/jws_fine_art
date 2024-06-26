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
        title: 'JWS Fine Art - Edit Gallery Piece Details',
        description: 'Edit gallery piece details for JWS Fine Art',
        keywords:
            'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Edit',
        applicationName: 'JWS Fine Art',
        icons: {
            icon: '/logo/JWS_ICON_MAIN.png',
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
