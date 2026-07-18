'use server';

import { eq, desc } from 'drizzle-orm';
import { db, piecesTable } from '@/db/db';
import { Pieces } from '@/db/schema';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/utils/auth/requireAdmin';
import { readOwnerArtworks } from '@/data/ownerReads';

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string }> {
    return requireAdmin('manage pieces');
}

export async function getPieces(): Promise<Pieces[]> {
    return readOwnerArtworks('gallery');
}

export async function getPrioritizedPieces(): Promise<Pieces[]> {
    return readOwnerArtworks('homepage');
}

export async function getDeletedPieces(): Promise<Pieces[]> {
    return readOwnerArtworks('archive');
}

export async function changeOrder(currIdList: number[], nextIdList: number[]): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        return { success: false, error: roleError };
    }

    const [currId, currOrderId] = currIdList;
    const [nextId, nextOrderId] = nextIdList;

    try {
        await db.update(piecesTable).set({ o_id: nextOrderId }).where(eq(piecesTable.id, currId));
        await db.update(piecesTable).set({ o_id: currOrderId }).where(eq(piecesTable.id, nextId));

        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/manage');
        revalidatePath('/admin/gallery');
        revalidatePath('/admin/slideshow');
        return { success: true };
    } catch (error) {
        console.error('Error changing piece order:', error);
        return { success: false, error: 'An error occurred while changing piece order.' };
    }
}

export async function changePriority(currIdList: number[], nextIdList: number[]): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        return { success: false, error: roleError };
    }

    const [currId, currPriorityId] = currIdList;
    const [nextId, nextPriorityId] = nextIdList;

    try {
        await db.update(piecesTable).set({ p_id: nextPriorityId }).where(eq(piecesTable.id, currId));
        await db.update(piecesTable).set({ p_id: currPriorityId }).where(eq(piecesTable.id, nextId));
        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/manage');
        revalidatePath('/admin/gallery');
        revalidatePath('/admin/slideshow');
        return { success: true };
    } catch (error) {
        console.error('Error changing piece priority:', error);
        return { success: false, error: 'An error occurred while changing piece priority.' };
    }
}

export async function setInactive(id: number): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        return { success: false, error: roleError };
    }

    try {
        await db.update(piecesTable).set({ active: false, o_id: -1000000 }).where(eq(piecesTable.id, id));
        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/manage');
        revalidatePath('/admin/gallery');
        revalidatePath('/admin/slideshow');
        return { success: true };
    } catch (error) {
        console.error('Error archiving piece:', error);
        return { success: false, error: 'An error occurred while archiving the piece.' };
    }
}

export async function setActive(id: number): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        return { success: false, error: roleError };
    }

    try {
        const lastPiece = await db.select().from(piecesTable).orderBy(desc(piecesTable.o_id)).limit(1);
        const newOId = lastPiece.length > 0 ? lastPiece[0].o_id + 1 : 1;

        await db.update(piecesTable).set({ active: true, o_id: newOId }).where(eq(piecesTable.id, id));
        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/manage');
        revalidatePath('/admin/gallery');
        revalidatePath('/admin/slideshow');
        return { success: true };
    } catch (error) {
        console.error('Error restoring piece:', error);
        return { success: false, error: 'An error occurred while restoring the piece.' };
    }
}
