import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Admin',
    description: 'Display admin info for authenticated users',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Admin',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import Admin from '@/app/admin/admin';
import { SignedIn } from '@clerk/nextjs';

export default async function Page() {
    return (
        <SignedIn>
            <PageLayout page="/admin">
                <Admin />
            </PageLayout>
        </SignedIn>
    );
}
