import { SignedIn } from '@clerk/nextjs';

import PageLayout from '@/components/layout/PageLayout';
import { Manage } from './Manage';
import { getPieces, getDeletedPieces } from './actions';

interface PageProps {
    searchParams?: {
        tab?: string;
    };
}

export const metadata = {
    title: 'JWS Fine Art - Admin Management',
    description: 'Jill Weeks Smith Admin Management',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Admin Management',
    },
};

export default async function ManagePage({ searchParams }: PageProps) {
    const tab = searchParams?.tab || 'manage';
    const pieces = await getPieces();
    const deletedPieces = await getDeletedPieces();

    return (
        <SignedIn>
            <PageLayout page="/manage">
                <Manage pieces={pieces} deletedPieces={deletedPieces} activeTab={tab} />
            </PageLayout>
        </SignedIn>
    );
}
