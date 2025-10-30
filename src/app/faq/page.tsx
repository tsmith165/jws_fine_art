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
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
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
    const isComingSoon = false; // Set this to true to display the coming soon text

    return <PageLayout page="/faq">{isComingSoon ? <ComingSoon /> : <FAQ />}</PageLayout>;
}

function ComingSoon() {
    return (
        <div className="flex h-full w-full flex-col items-center justify-center space-y-4 bg-stone-900 p-4">
            <h1 className="bg-gradient-to-r from-primary via-primary_dark to-primary bg-clip-text text-center text-4xl font-bold text-transparent">
                Events
            </h1>
            <p className="text-center text-lg text-stone-300">Coming Soon!</p>
        </div>
    );
}
