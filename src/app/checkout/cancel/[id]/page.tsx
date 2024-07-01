import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Cancel Checkout',
    description: 'Cancel Checkout for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout, Cancel',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Cancel Checkout',
        description: 'Cancel Checkout for JWS Fine Art',
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

import { fetchPieces } from '@/app/actions';
import { Pieces } from '@/db/schema';
import PageLayout from '@/components/layout/PageLayout';
import Cancel from '@/app/checkout/cancel/[id]/Cancel';

export default async function Page({ params }: { params: { id: string } }) {
    const piece_list: Pieces[] = await fetchPieces();
    const passed_o_id = params.id;
    const current_piece = piece_list.find((piece) => piece.o_id === Number(passed_o_id));

    return (
        <PageLayout page={`/checkout/cancel/${passed_o_id}`}>
            <Cancel piece_list={piece_list} current_id={params.id} />
        </PageLayout>
    );
}

export const revalidate = 60;
