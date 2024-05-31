import PageLayout from '@/components/layout/PageLayout';
import { SignedIn } from '@clerk/nextjs';
import CreatePiece from './CreatePiece';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JWS Fine Art - New Piece',
    description: 'Create a new piece for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Create New Piece',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
        shortcut: '/JWS_ICON_MAIN.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Create New Piece',
        description: 'Create New Piece for JWS Fine Art',
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

export default function NewPiecePage() {
    return (
        <SignedIn>
            <PageLayout page="/edit/new">
                <CreatePiece />
            </PageLayout>
        </SignedIn>
    );
}
