import { redirect } from 'next/navigation';
import { fetchFirstPieceId, fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Details from '@/app/details/[id]/Details';
import LoadingSpinner from '@/components/layout/LoadingSpinner';

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
            icon: '/JWS_ICON.png',
        },
        openGraph: {
            images: '/opengraph-image.png',
        },
    };
}

async function fetchPieceData(id: number) {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);
    return { piece, next_id, last_id };
}

export default function Page({ params, searchParams }: PageProps) {
    const { id: idParam } = params;
    let id = idParam ? parseInt(idParam, 10) : undefined;

    if (!id) {
        const firstIdPromise = fetchFirstPieceId();
        const firstId = React.use(firstIdPromise);
        if (firstId) {
            redirect(`/details/${firstId}`);
        } else {
            return <div>No pieces available.</div>;
        }
    }

    const pieceDataPromise = fetchPieceData(id);
    const pieceData = React.use(pieceDataPromise);
    const { piece, next_id, last_id } = pieceData;
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    return (
        <PageLayout page={`/details/${id}`}>
            <Suspense fallback={<LoadingSpinner page="Details" />}>
                <Details piece={piece} selectedIndex={selectedIndex} type={type} next_id={next_id || 0} last_id={last_id || 0} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
