'use server';

import { eq, desc, asc, gt, lt, and, inArray } from 'drizzle-orm';
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

export async function fetchPieceIds(): Promise<number[]> {
    const pieceList = await db.select({ id: piecesTable.id }).from(piecesTable).where(eq(piecesTable.active, true));
    return pieceList.map((piece) => piece.id);
}

export async function fetchPieceById(id: number) {
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.id, id)).execute();
    const extraImages = await db
        .select()
        .from(extraImagesTable)
        .where(eq(extraImagesTable.piece_id, id))
        .orderBy(asc(extraImagesTable.id))
        .execute();
    const progressImages = await db
        .select()
        .from(progressImagesTable)
        .where(eq(progressImagesTable.piece_id, id))
        .orderBy(asc(progressImagesTable.id))
        .execute();

    const pieceData = {
        ...piece[0],
        extraImages,
        progressImages,
    };

    return pieceData;
}

export async function fetchPiecesByIds(ids: number[]) {
    const pieces = await db.select().from(piecesTable).where(inArray(piecesTable.id, ids)).execute();
    const piecesWithImages = await Promise.all(
        pieces.map(async (piece) => {
            const extraImages = await db
                .select()
                .from(extraImagesTable)
                .where(eq(extraImagesTable.piece_id, piece.id))
                .orderBy(asc(extraImagesTable.id))
                .execute();
            const progressImages = await db
                .select()
                .from(progressImagesTable)
                .where(eq(progressImagesTable.piece_id, piece.id))
                .orderBy(asc(progressImagesTable.id))
                .execute();

            return {
                ...piece,
                extraImages,
                progressImages,
            };
        }),
    );

    return piecesWithImages;
}

export async function fetchAdjacentPieceIds(currentId: number) {
    console.log(`Fetching adjacent piece IDs for piece ID: ${currentId}`);
    const currentPiece = await db.select().from(piecesTable).where(eq(piecesTable.id, currentId)).limit(1);

    if (currentPiece.length === 0) {
        return { next_id: -1, last_id: -1 };
    }

    const currentOId = currentPiece[0].o_id;

    // Fetch the next piece by o_id
    const nextPiece = await db
        .select()
        .from(piecesTable)
        .where(and(gt(piecesTable.o_id, currentOId), eq(piecesTable.active, true)))
        .orderBy(asc(piecesTable.o_id))
        .limit(1);

    // Fetch the last piece by o_id
    const lastPiece = await db
        .select()
        .from(piecesTable)
        .where(and(lt(piecesTable.o_id, currentOId), eq(piecesTable.active, true)))
        .orderBy(desc(piecesTable.o_id))
        .limit(1);

    // Fetch the piece with the minimum o_id
    const firstPiece = await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(asc(piecesTable.o_id)).limit(1);

    // Fetch the piece with the maximum o_id
    const maxOIdPiece = await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(desc(piecesTable.o_id)).limit(1);

    const next_id = nextPiece.length > 0 ? nextPiece[0].id : firstPiece[0].id;
    const last_id = lastPiece.length > 0 ? lastPiece[0].id : maxOIdPiece[0].id;

    console.log(`Found next_id: ${next_id} and last_id: ${last_id}`);

    return { next_id, last_id };
}

export async function fetchFirstPieceId(): Promise<number | null> {
    const piece = await db
        .select({
            id: piecesTable.id,
        })
        .from(piecesTable)
        .where(and(eq(piecesTable.active, true), eq(piecesTable.sold, false), eq(piecesTable.available, true)))
        .orderBy(desc(piecesTable.o_id))
        .limit(1);

    return piece.length > 0 ? piece[0].id : null;
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

export async function fetchPieceImageById(id: number) {
    const piece = await db
        .select({
            image_path: piecesTable.image_path,
            width: piecesTable.width,
            height: piecesTable.height,
        })
        .from(piecesTable)
        .where(eq(piecesTable.id, id))
        .execute();

    return piece[0] || null;
}
