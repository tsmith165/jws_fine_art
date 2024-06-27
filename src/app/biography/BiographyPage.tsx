import { BIOGRAPHY_TEXT } from '@/lib/biography_text';
import { db, piecesTable } from '@/db/db';
import { eq, desc } from 'drizzle-orm';
import Biography from './Biography';

async function fetchImages(limit: number) {
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

async function fetchBiographyData() {
    const numParagraphs = BIOGRAPHY_TEXT.length;
    const pieces = await fetchImages(numParagraphs);
    return pieces.map((piece, index) => ({
        id: piece.id,
        title: piece.title,
        image_path: piece.imagePath,
        width: piece.width,
        height: piece.height,
        bio_paragraph: BIOGRAPHY_TEXT[index],
    }));
}

export default async function HomepagePage() {
    const biographyData = await fetchBiographyData();

    return <Biography biographyData={biographyData} />;
}
