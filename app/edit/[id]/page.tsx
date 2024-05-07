import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Edit Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Edit Piece Details',
    },
};

import { fetchPieces, getMostRecentId } from '@/app/actions';
import PageLayout from '@/components/layout/PageLayout';
import Edit from '@/app/edit/Edit';
import { SignedIn } from '@clerk/nextjs';

export default async function Page({ params }: { params: { id: string } }) {
    const piece_list = await fetchPieces();
    const most_recent_id = await getMostRecentId();

    return (
        <PageLayout page={`/edit/${params.id}`}>
            <SignedIn>
                <Edit piece_list={piece_list} current_id={params.id} most_recent_id={most_recent_id!} />
            </SignedIn>
        </PageLayout>
    );
}
