import type { Metadata } from 'next';
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';
import { BIOGRAPHY_TEXT } from '@/lib/biography_text';
import { db, piecesTable } from '@/db/db';
import { eq, desc } from 'drizzle-orm';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Biography',
    description: 'Jill Weeks Smith Biography',
    keywords:
        'Jill Weeks Smith, JWS Fine Art, Jill Weeks Smith Art, JWS Art, Art, Artist, Oil Painting, Oil, Gallery, Jill, Weeks, Smith, Biographical, Biography',
    applicationName: 'JWS Fine Art',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
        shortcut: '/JWS_ICON_MAIN.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Biography',
        description: 'Biography for JWS Fine Art',
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

async function fetchHomepageImages(limit: number) {
    console.log(`Fetching pieces with Drizzle`);
    const pieces = await db
        .select({
            id: piecesTable.id,
            title: piecesTable.title,
            imagePath: piecesTable.image_path,
            width: piecesTable.width,
            height: piecesTable.height,
        })
        .from(piecesTable)
        .where(eq(piecesTable.active, true))
        .orderBy(desc(piecesTable.p_id))
        .limit(limit);

    return pieces;
}

async function fetchHomepageData() {
    const numParagraphs = BIOGRAPHY_TEXT.length;
    const homepage_pieces = await fetchHomepageImages(numParagraphs);
    return homepage_pieces.map((piece, index) => ({
        id: piece.id,
        title: piece.title,
        image_path: piece.imagePath,
        width: piece.width,
        height: piece.height,
        bio_paragraph: BIOGRAPHY_TEXT[index],
    }));
}

export default async function Page() {
    const homepageData = await fetchHomepageData();

    return (
        <PageLayout page="/">
            <Homepage homepageData={homepageData} />
        </PageLayout>
    );
}

export const revalidate = 60;
