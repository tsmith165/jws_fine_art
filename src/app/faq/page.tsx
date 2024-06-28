import React from 'react';
import type { Metadata } from 'next';
import PageLayout from '@/components/layout/PageLayout';
import FAQ from './faq';

export const metadata: Metadata = {
    title: 'JWS Fine Art - FAQ',
    description: 'FAQ page for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Fine Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Masonry',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_MAIN.png',
        shortcut: '/logo/JWS_ICON_MAIN.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - FAQ',
        description: 'FAQ for JWS Fine Art',
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

export default async function FAQPage() {
    return (
        <PageLayout page="faq">
            <FAQ />
        </PageLayout>
    );
}