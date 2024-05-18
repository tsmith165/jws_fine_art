import { Metadata } from 'next';
import { Pieces } from '@/db/schema';
import { fetchPieces } from '@/app/actions';
import Gallery from './Gallery';
import PageLayout from '@/components/layout/PageLayout';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Gallery',
    description: 'Gallery page for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Gallery',
    },
};

export default async function Page() {
    const pieces: Pieces[] = await fetchPieces();

    return (
        <PageLayout page="/gallery">
            <Gallery pieces={pieces} />
        </PageLayout>
    );
}
