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

import PageLayout from '@/components/layout/PageLayout';
import { SignedIn } from '@clerk/nextjs';
import ImageEditor from './ImageEditor';

export default async function Page({ params }: { params: { id: string } }) {
    return (
        <PageLayout page={`/edit/${params.id}`}>
            <SignedIn>
                <ImageEditor pieceId={params.id} />
            </SignedIn>
        </PageLayout>
    );
}
