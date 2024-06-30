import { eq, asc, desc } from 'drizzle-orm';
import { db, piecesTable } from '@/db/db';
import { Pieces } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function getPieces(): Promise<Pieces[]> {
    return await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(asc(piecesTable.o_id));
}

export async function getPrioritizedPieces(): Promise<Pieces[]> {
    return await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(desc(piecesTable.p_id));
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

    revalidatePath(`/manage`);
}

export async function changePriority(currIdList: number[], nextIdList: number[]): Promise<void> {
    const [currId, currPriorityId] = currIdList;
    const [nextId, nextPriorityId] = nextIdList;
    console.log(`Swapping priority ${currId} (${currPriorityId}) with ${nextId} (${nextPriorityId})`);

    await db.update(piecesTable).set({ p_id: nextPriorityId }).where(eq(piecesTable.id, currId));
    await db.update(piecesTable).set({ p_id: currPriorityId }).where(eq(piecesTable.id, nextId));
    revalidatePath(`/manage`);
}

export async function setInactive(id: number): Promise<void> {
    console.log(`Setting piece with id: ${id} as inactive`);
    await db.update(piecesTable).set({ active: false, o_id: -1000000 }).where(eq(piecesTable.id, id));
    revalidatePath(`/manage`);
}

export async function setActive(id: number): Promise<void> {
    console.log(`Setting piece with id: ${id} as active`);

    const lastPiece = await db.select().from(piecesTable).orderBy(desc(piecesTable.o_id)).limit(1);
    const newOId = lastPiece.length > 0 ? lastPiece[0].o_id + 1 : 1;

    await db.update(piecesTable).set({ active: true, o_id: newOId }).where(eq(piecesTable.id, id));
    revalidatePath(`/manage`);
}
