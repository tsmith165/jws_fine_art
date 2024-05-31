import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Edit Piece Details',
    description: 'Edit gallery piece details for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Edit Images',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Edit Images',
        description: 'Edit Images for JWS Fine Art',
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
