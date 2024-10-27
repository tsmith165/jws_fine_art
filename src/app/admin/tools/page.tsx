// File: /src/app/admin/tools/page.tsx

import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Admin Tools',
    description: 'Admin tools for JWS Fine Art',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout, Admin',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Admin Tools',
        description: 'Admin tools for JWS Fine Art',
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

import Tools from '@/app/admin/tools/tools';
import PageLayout from '@/components/layout/PageLayout';

interface PageProps {
    searchParams?: Promise<{
        tab?: string;
    }>;
}

export default async function AdminToolsPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const activeTab = searchParams?.tab || 'backup';

    return (
        <PageLayout page="/admin/tools">
            <div className="flex h-full w-full flex-col items-center p-5">
                <Tools activeTab={activeTab} />
            </div>
        </PageLayout>
    );
}

export const revalidate = 60;
