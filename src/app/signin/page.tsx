import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Sign In',
    description: 'Sign In to JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Sign In',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_MAIN.png',
        shortcut: '/logo/JWS_ICON_MAIN.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Sign In',
        description: 'Sign In for JWS Fine Art',
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

import PageLayout from '@/components/layout/PageLayout';
import Sign_In from '@/app/signin/Sign_In';

export default async function Page() {
    return (
        <PageLayout page="/signin">
            <Sign_In />
        </PageLayout>
    );
}

export const revalidate = 3600;
