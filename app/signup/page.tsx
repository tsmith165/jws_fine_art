import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Sign Up',
    description: 'Sign up to JWS Fine Art',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/og-image.png',
    },
};

import PageLayout from '@/components/layout/PageLayout';
import Sign_Up from '@/app/signup/Sign_Up';

export default async function Page() {
    return (
        <PageLayout page="/signup">
            <Sign_Up />
        </PageLayout>
    );
}
