import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'JWS Fine Art - New Piece',
    description: 'Create a new piece for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Create New Piece',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Create New Piece',
        description: 'Create New Piece for JWS Fine Art',
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

import { Protect } from '@clerk/nextjs';

import PageLayout from '@/components/layout/PageLayout';
import CreatePiece from '@/app/admin/edit/new/CreatePiece';

export default function NewPiecePage() {
    return (
        <PageLayout page="/edit/new">
            <CreatePiece />
        </PageLayout>
    );
}

export const revalidate = 3660;
