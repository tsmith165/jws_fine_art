import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Homepage',
    description: 'Jill Weeks Smith Biography',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        images: '/opengraph-image.png',
    },
};

import { db, piecesTable } from '@/db/db';
import { eq, desc } from 'drizzle-orm';

import React, { Suspense } from 'react';
import LoadingSpinner from '@/components/layout/LoadingSpinner';
import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';
import { BIOGRAPHY_TEXT } from '@/lib/biography_text';

export default async function Page() {
    const numParagraphs = BIOGRAPHY_TEXT.length;
    const homepage_pieces = await fetchHomepageImages(numParagraphs);
    const homepage_data = homepage_pieces.map((piece, index) => ({
        id: piece.id,
        title: piece.title,
        image_path: piece.imagePath,
        width: piece.width,
        height: piece.height,
        bio_paragraph: BIOGRAPHY_TEXT[index],
    }));

    return (
        <PageLayout page="/">
            <Suspense fallback={<LoadingSpinner />}>
                <Homepage homepage_data={homepage_data} />
            </Suspense>
        </PageLayout>
    );
}

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
