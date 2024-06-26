import { Metadata } from 'next';
import React, { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import DetailsPage from './DetailsPage';
import TitleComponent from './TitleComponent';

interface PageProps {
    params: {
        id: string;
    };
    searchParams?: {
        selected?: string;
        type?: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    return {
        title: 'JWS Fine Art - Gallery Piece Details',
        description: 'View gallery piece details for JWS Fine Art',
        keywords:
            'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Piece Details',
        applicationName: 'JWS Fine Art',
        icons: {
            icon: '/logo/JWS_ICON_MAIN.png',
        },
        openGraph: {
            title: 'JWS Fine Art - Piece Details',
            description: 'Piece Details for JWS Fine Art',
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
}

export default async function Page({ params, searchParams }: PageProps) {
    const { id: idParam } = params;
    const id = parseInt(idParam, 10);
    const selectedIndex = parseInt(searchParams?.selected || '0', 10);
    const type = searchParams?.type || 'gallery';

    const fallback = (
        <div className="relative z-0 flex h-[calc(100dvh-80px)] w-full flex-col lg:flex-row">
            <div className="relative z-0 flex h-1/2 w-full flex-col bg-secondary_dark md:h-3/5 lg:h-full lg:w-[65%]"></div>
            <div className="relative z-0 flex h-1/2 w-full flex-col overflow-x-hidden bg-secondary_light md:h-2/5 lg:h-full lg:w-[35%]">
                <TitleComponent title={''} next_id={-1} last_id={-1} />
            </div>
        </div>
    );

    return (
        <PageLayout page={`/details/${id}`}>
            <Suspense fallback={fallback}>
                <DetailsPage id={id} selectedIndex={selectedIndex} type={type} />
            </Suspense>
        </PageLayout>
    );
}

export const revalidate = 60;
