// File 1: /app/manage/actions.ts

import { eq, asc, desc } from 'drizzle-orm';
import { db, piecesTable } from '@/db/db';
import { Pieces } from '@/db/schema';

export async function getPieces(): Promise<Pieces[]> {
    return await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(asc(piecesTable.o_id));
}

export async function getDeletedPieces(): Promise<Pieces[]> {
    return await db.select().from(piecesTable).where(eq(piecesTable.active, false)).orderBy(asc(piecesTable.o_id));
}

export async function changeOrder(currIdList: number[], nextIdList: number[]): Promise<void> {
    const [currId, currOrderId] = currIdList;
    const [nextId, nextOrderId] = nextIdList;
    console.log(`Swapping ${currId} (${currOrderId}) with ${nextId} (${nextOrderId})`);

    await db.update(piecesTable).set({ o_id: nextOrderId }).where(eq(piecesTable.id, currId));
    await db.update(piecesTable).set({ o_id: currOrderId }).where(eq(piecesTable.id, nextId));
}

export async function setInactive(id: number): Promise<void> {
    console.log(`Setting piece with id: ${id} as inactive`);
    await db.update(piecesTable).set({ active: false, o_id: -1000000 }).where(eq(piecesTable.id, id));
}

export async function setActive(id: number): Promise<void> {
    console.log(`Setting piece with id: ${id} as active`);

    const lastPiece = await db.select().from(piecesTable).orderBy(desc(piecesTable.o_id)).limit(1);
    const newOId = lastPiece.length > 0 ? lastPiece[0].o_id + 1 : 1;

    await db.update(piecesTable).set({ active: true, o_id: newOId }).where(eq(piecesTable.id, id));
}

export async function editDetails(details: Partial<Pieces>): Promise<void> {
    console.log(`Editing piece with id: ${details.id}`);
    await db
        .update(piecesTable)
        .set({
            title: details.title ?? undefined,
            width: details.width ? parseInt(details.width.toString()) : undefined,
            height: details.height ? parseInt(details.height.toString()) : undefined,
            description: details.description ?? undefined,
            piece_type: details.piece_type ?? undefined,
            sold: details.sold ?? undefined,
            price: details.price ? parseInt(details.price.toString()) : undefined,
            real_width: details.real_width ?? undefined,
            real_height: details.real_height ?? undefined,
            instagram: details.instagram?.split('/').pop() ?? undefined,
            theme: details.theme?.replace('None, ', '') ?? undefined,
            available: details.available ?? undefined,
            framed: details.framed ?? undefined,
            comments: details.comments ?? undefined,
            image_path: details.image_path ?? undefined,
        })
        .where(eq(piecesTable.id, details.id as number));
}

export async function createPiece(details: Omit<Pieces, 'id' | 'o_id'>): Promise<void> {
    const lastPiece = await db.select().from(piecesTable).orderBy(desc(piecesTable.o_id)).limit(1);
    const newOId = lastPiece.length > 0 ? lastPiece[0].o_id + 1 : 1;

    await db.insert(piecesTable).values({
        title: details.title,
        image_path: details.image_path,
        width: details.width,
        height: details.height,
        description: details.description ?? undefined,
        piece_type: details.piece_type ?? undefined,
        sold: details.sold,
        price: details.price,
        real_width: details.real_width ?? undefined,
        real_height: details.real_height ?? undefined,
        active: true,
        instagram: details.instagram?.split('/').pop() ?? undefined,
        theme: details.theme?.replace('None, ', '') ?? undefined,
        available: details.available,
        framed: details.framed,
        comments: details.comments ?? undefined,
        o_id: newOId,
        class_name: details.class_name,
    });
}
