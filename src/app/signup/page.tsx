import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Sign Up',
    description: 'Sign up to JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Sign Up',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Sign Up',
        description: 'Sign Up fsor JWS Fine Art',
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
import Sign_Up from '@/app/signup/Sign_Up';

export default async function Page() {
    return (
        <PageLayout page="/signup">
            <Sign_Up />
        </PageLayout>
    );
}

export const revalidate = 3600;
