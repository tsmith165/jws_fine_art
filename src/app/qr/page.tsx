import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import QRCodePage from './QRCodePage';

export const metadata: Metadata = {
    title: 'JWS Fine Art - QR Code',
    description: 'Scan to visit JWS Fine Art',
    keywords: 'JWS Fine Art, QR Code',
    openGraph: {
        title: 'JWS Fine Art - QR Code',
        description: 'Scan to visit JWS Fine Art',
        siteName: 'JWS Fine Art',
        url: 'https://www.jwsfineart.com/qr',
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

export default async function Page() {
    return (
        <PageLayout page="/qr">
            <Suspense fallback={<QRCodeSkeleton />}>
                <QRCodePage />
            </Suspense>
        </PageLayout>
    );
}

const QRCodeSkeleton = () => {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
            <div className="h-[300px] w-[300px] animate-pulse bg-stone-900"></div>
        </div>
    );
};

export const revalidate = 60;
