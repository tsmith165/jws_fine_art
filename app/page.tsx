import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Homepage',
    description: 'Jill Weeks Smith Biography',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Homepage',
    },
};

import { db, piecesTable } from '@/db/db';
import { eq, desc } from 'drizzle-orm';

import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';
import { BIOGRAPHY_TEXT } from '@/lib/biography_text';

export default async function Page() {
    const numParagraphs = BIOGRAPHY_TEXT.length;
    const homepage_pieces = await fetchHomepageImages(numParagraphs);
    const homepage_data = homepage_pieces.map((piece, index) => ({
        id: piece.id,
        title: piece.name,
        image_path: piece.imagePath,
        bio_paragraph: BIOGRAPHY_TEXT[index],
    }));

    return (
        <PageLayout page="/">
            <Homepage homepage_data={homepage_data} />
        </PageLayout>
    );
}

async function fetchHomepageImages(limit: number) {
    console.log(`Fetching pieces with Drizzle`);
    const pieces = await db
        .select({
            imagePath: piecesTable.image_path,
            id: piecesTable.id,
            name: piecesTable.title,
        })
        .from(piecesTable)
        .where(eq(piecesTable.active, true))
        .orderBy(desc(piecesTable.p_id))
        .limit(limit);

    return pieces;
}
