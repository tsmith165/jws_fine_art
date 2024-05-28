import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Admin Management',
    description: 'Jill Weeks Smith Admin Management',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

import { getPieces, getDeletedPieces, getPrioritizedPieces } from './actions';

import { SignedIn } from '@clerk/nextjs';

import PageLayout from '@/components/layout/PageLayout';
import { Manage } from './Manage';

interface PageProps {
    searchParams?: {
        tab?: string;
    };
}

export default async function ManagePage({ searchParams }: PageProps) {
    const tab = searchParams?.tab || 'manage';
    const pieces = await getPieces();
    const deletedPieces = await getDeletedPieces();
    const prioritized_pieces = await getPrioritizedPieces();

    return (
        <SignedIn>
            <PageLayout page="/manage">
                <Manage pieces={pieces} deletedPieces={deletedPieces} prioritized_pieces={prioritized_pieces} activeTab={tab} />
            </PageLayout>
        </SignedIn>
    );
}
