import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Profile Management',
    description: 'Profile management for JWS Fine Art',
    keywords: 'Jill Weeks Smith, JWS Fine Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Profile',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.jpg',
        shortcut: '/JWS_ICON_MAIN.jpg',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Profile',
        description: 'Profile for JWS Fine Art',
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

import PageLayout from '@/components/layout/PageLayout';
import Profile from '@/app/profile/profile';

export default async function Page() {
    return (
        <PageLayout page="/profile">
            <Profile />
        </PageLayout>
    );
}
