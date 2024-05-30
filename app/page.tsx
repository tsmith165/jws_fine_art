import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';
import { BIOGRAPHY_TEXT } from '@/lib/biography_text';
import { db, piecesTable } from '@/db/db';
import { eq, desc } from 'drizzle-orm';

export const metadata: Metadata = {
    title: 'JWS Fine Art - Biography',
    description: 'Jill Weeks Smith Biography',
    icons: {
        icon: '/JWS_ICON_MAIN.png',
    },
    openGraph: {
        images: '/og-image.png',
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

export default function Page() {
    const homepageDataPromise = fetchHomepageData();

    return (
        <PageLayout page="/">
            <Homepage homepageDataPromise={homepageDataPromise} />
        </PageLayout>
    );
}
