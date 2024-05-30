import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Sign In',
    description: 'Sign In to JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        images: '/og-image.png',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import Sign_In from '@/app/signin/Sign_In';

export default async function Page() {
    return (
        <PageLayout page="/signin">
            <Sign_In />
        </PageLayout>
    );
}
