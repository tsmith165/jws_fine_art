import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Checkout',
    description: 'Checkout for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Checkout',
        description: 'Checkout for JWS Fine Art',
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

import { fetchPieces, getMostRecentId } from '@/app/actions';
import { Pieces } from '@/db/schema';

import PageLayout from '@/components/layout/PageLayout';
import Checkout from '@/app/checkout/[id]/Checkout';

export default async function Page(props: { params: { id: string } }) {
    const piece_list: Pieces[] = await fetchPieces();
    const most_recent_id: number | null = await getMostRecentId();

    return (
        <PageLayout page={`/checkout/${props.params.id}`}>
            <Checkout piece_list={piece_list} most_recent_id={most_recent_id!} current_id={props.params.id} />
        </PageLayout>
    );
}
