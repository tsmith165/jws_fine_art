import { eq, desc, asc, gt, lt, and } from 'drizzle-orm';
import { db, piecesTable, extraImagesTable, progressImagesTable, verifiedTransactionsTable } from '@/db/db';
import { VerifiedTransactions, PiecesWithImages, ExtraImages, ProgressImages } from '@/db/schema';

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

export async function fetchPieceById(id: number): Promise<PiecesWithImages | null> {
    console.log(`Fetching piece by ID: ${id}`);
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.id, id)).limit(1);

    if (piece.length === 0) {
        return null;
    }

    const extraImages: ExtraImages[] = await db.select().from(extraImagesTable).where(eq(extraImagesTable.piece_id, piece[0].id));
    const progressImages: ProgressImages[] = await db
        .select()
        .from(progressImagesTable)
        .where(eq(progressImagesTable.piece_id, piece[0].id));

    return {
        ...piece[0],
        extraImages,
        progressImages,
    };
}

export async function fetchAdjacentPieceIds(currentId: number): Promise<{ next_id: number; last_id: number }> {
    console.log(`Fetching adjacent piece IDs for piece ID: ${currentId}`);
    const currentPiece = await db.select().from(piecesTable).where(eq(piecesTable.id, currentId)).limit(1);

    if (currentPiece.length === 0) {
        return { next_id: -1, last_id: -1 };
    }

    const currentOId = currentPiece[0].o_id;

    // Fetch the next piece by o_id
    const nextPiece = await db.select().from(piecesTable).where(gt(piecesTable.o_id, currentOId)).orderBy(asc(piecesTable.o_id)).limit(1);

    // Fetch the last piece by o_id
    const lastPiece = await db.select().from(piecesTable).where(lt(piecesTable.o_id, currentOId)).orderBy(desc(piecesTable.o_id)).limit(1);

    // Fetch the piece with the minimum o_id
    const firstPiece = await db.select().from(piecesTable).orderBy(asc(piecesTable.o_id)).limit(1);

    // Fetch the piece with the maximum o_id
    const maxOIdPiece = await db.select().from(piecesTable).orderBy(desc(piecesTable.o_id)).limit(1);

    const next_id = nextPiece.length > 0 ? nextPiece[0].id : firstPiece[0].id;
    const last_id = lastPiece.length > 0 ? lastPiece[0].id : maxOIdPiece[0].id;

    console.log(`Found next_id: ${next_id} and last_id: ${last_id}`);

    return { next_id, last_id };
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
