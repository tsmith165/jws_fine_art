import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import QRCodePage from './QRCodePage';
import { qrConfigs } from './qr-config';

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

const QRCodeSkeleton = ({ size }: { size: number }) => {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center">
            <div className="animate-pulse bg-stone-900" style={{ height: size, width: size }}></div>
        </div>
    );
};

export default function Page() {
    return (
        <PageLayout page="/qr">
            <Suspense fallback={<QRCodeSkeleton size={qrConfigs.color.size} />}>
                <QRCodePage />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
