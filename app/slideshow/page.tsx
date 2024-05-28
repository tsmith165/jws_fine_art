import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery Slideshow',
    description: 'Gallery slideshow for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

import { Pieces } from '@/db/schema';
import { fetchPieces } from '@/app/actions';

import PageLayout from '@/components/layout/PageLayout';
import Slideshow from '@/app/slideshow/Slideshow';

export default async function Page() {
    const pieceList: Pieces[] = await fetchPieces();

    return (
        <PageLayout page="/slideshow">
            <Slideshow piece_list={pieceList} />
        </PageLayout>
    );
}
