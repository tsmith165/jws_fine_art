import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Edit Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

import { fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/edit/[id]/Edit';
import { SignedIn } from '@clerk/nextjs';

export default async function Page({ params }: { params: { id: string } }) {
    const piece = await fetchPieceById(parseInt(params.id));
    const { next_id, last_id } = await fetchAdjacentPieceIds(parseInt(params.id));

    return (
        <PageLayout page={`/edit/${params.id}`}>
            <SignedIn>
                <Edit piece={piece} current_id={params.id} next_id={next_id || 0} last_id={last_id || 0} />
            </SignedIn>
        </PageLayout>
    );
}
