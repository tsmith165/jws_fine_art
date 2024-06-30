import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Admin',
    description: 'Display admin info for authenticated users',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Checkout, Admin',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/logo/JWS_ICON_260.png',
        shortcut: '/logo/JWS_ICON_260.png',
        apple: '/favicon/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Admin',
        description: 'Admin for JWS Fine Art',
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

import { SignedIn } from '@clerk/nextjs';
import { promises as fs } from 'fs';
import path from 'path';

import { exportPieces } from '@/app/admin/tools/actions';

import PageLayout from '@/components/layout/PageLayout';

export default async function AdminPage() {
    const handleExport = async () => {
        try {
            const buffer = await exportPieces();
            const filePath = path.join(process.cwd(), 'public', 'pieces.xlsx');
            await fs.writeFile(filePath, buffer);
        } catch (error) {
            console.error('Failed to export pieces:', error);
        }
    };

    await handleExport();

    return (
        <SignedIn>
            <PageLayout page="/admin">
                <div className="flex h-full w-full flex-col items-center p-5">
                    <div className="w-full max-w-xl rounded-md border-2 border-primary_dark">
                        <div className="rounded-t-md bg-secondary p-4 font-lato text-lg text-primary">Data Backup</div>
                        <div className="flex items-center justify-center rounded-b-md bg-primary p-2">
                            <a
                                href="/pieces.xlsx"
                                className="text-dark cursor-pointer rounded-md border-none bg-secondary_dark px-4 py-2 font-lato uppercase hover:bg-primary_dark hover:text-secondary_dark"
                            >
                                Download Pieces as XLSX
                            </a>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </SignedIn>
    );
}

export const revalidate = 60;
