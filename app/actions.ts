import { eq, desc, asc, gt, lt, and } from 'drizzle-orm';
import { db, piecesTable, extraImagesTable, progressImagesTable, verifiedTransactionsTable } from '@/db/db';
import { PiecesWithImages, ExtraImages, ProgressImages, VerifiedTransactions } from '@/db/schema';

export async function fetchPieces(): Promise<PiecesWithImages[]> {
    console.log(`Fetching pieces with Drizzle`);
    const pieceList = await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(desc(piecesTable.o_id));

    const piecesWithImages = await Promise.all(
        pieceList.map(async (piece) => {
            const extraImages: ExtraImages[] = await db.select().from(extraImagesTable).where(eq(extraImagesTable.piece_id, piece.id));
            const progressImages: ProgressImages[] = await db
                .select()
                .from(progressImagesTable)
                .where(eq(progressImagesTable.piece_id, piece.id));

            return {
                ...piece,
                extraImages,
                progressImages,
            };
        }),
    );

    return piecesWithImages;
}

export async function fetchPieceById(id: number) {
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.id, id)).execute();
    const extraImages = await db.select().from(extraImagesTable).where(eq(extraImagesTable.piece_id, id)).execute();
    const progressImages = await db.select().from(progressImagesTable).where(eq(progressImagesTable.piece_id, id)).execute();

    const pieceData = {
        ...piece[0],
        extraImages,
        progressImages,
    };

    return pieceData;
}

export async function fetchAdjacentPieceIds(id: number) {
    const nextPiece = await db
        .select({ id: piecesTable.id })
        .from(piecesTable)
        .where(eq(piecesTable.id, id + 1))
        .limit(1)
        .execute();
    const lastPiece = await db
        .select({ id: piecesTable.id })
        .from(piecesTable)
        .where(eq(piecesTable.id, id - 1))
        .limit(1)
        .execute();

    return {
        next_id: nextPiece[0]?.id || null,
        last_id: lastPiece[0]?.id || null,
    };
}

export async function getMostRecentId(): Promise<number | null> {
    console.log('Fetching most recent piece ID...');
    const piece = await db
        .select()
        .from(piecesTable)
        .where(and(eq(piecesTable.active, true), eq(piecesTable.active, true)))
        .orderBy(desc(piecesTable.o_id))
        .limit(1);

    return piece[0]?.id || null;
}

export async function fetchVerifiedPayments(): Promise<VerifiedTransactions[]> {
    console.log(`Fetching verified payments with Drizzle`);
    const verifiedList = await db.select().from(verifiedTransactionsTable);

    console.log('Verified Payments List (Next Line):');
    console.log(verifiedList);

    const formattedList = verifiedList.map((payment) => ({
        ...payment,
        date: new Date(payment.date).toUTCString(),
    }));

    console.log('Formatted Verified Payments List (Next Line):');
    console.log(formattedList);

    return formattedList;
}
