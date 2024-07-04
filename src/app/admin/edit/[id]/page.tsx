import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Edit Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Edit Piece Details',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
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
import { Protect } from '@clerk/nextjs';

import { fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';

import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/admin/edit/[id]/Edit';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

async function fetchPieceData(id: number) {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);
    return { ...piece, next_id, last_id };
}

export default function Page({ params }: { params: { id: string } }) {
    const id = parseInt(params.id, 10);
    const pieceDataPromise = fetchPieceData(id);

    return (
        <PageLayout page={`/edit/${id}`}>
            <Protect role="org:ADMIN">
                <Suspense fallback={<LoadingSpinner page="Edit" />}>
                    <Edit pieceDataPromise={pieceDataPromise} current_id={id} />
                </Suspense>
            </Protect>
        </PageLayout>
    );
}

export const revalidate = 60;
