import PageLayout from '@/components/layout/PageLayout';
import { SignedIn } from '@clerk/nextjs';
import CreatePiece from './CreatePiece';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JWS Fine Art - New Piece',
    description: 'Create a new piece for JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com',
        images: '/og-image.png',
    },
};

export default function NewPiecePage() {
    return (
        <SignedIn>
            <PageLayout page="/edit/new">
                <CreatePiece />
            </PageLayout>
        </SignedIn>
    );
}
