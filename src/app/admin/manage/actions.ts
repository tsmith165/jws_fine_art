'use server';

import { Pieces } from '@/types/artwork';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/utils/auth/requireAdmin';
import { readOwnerArtworks } from '@/data/ownerReads';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { api } from '../../../../convex/_generated/api';

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

    const [currId] = currIdList;
    const [nextId] = nextIdList;

    try {
        const client = await getAuthenticatedOwnerConvexClient('reorder artwork');
        await client.mutation(api.ownerMutations.swapArtworkOrder, {
            currentLegacyId: currId,
            targetLegacyId: nextId,
            kind: 'gallery',
        });

        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/artwork');
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

    const [currId] = currIdList;
    const [nextId] = nextIdList;

    try {
        const client = await getAuthenticatedOwnerConvexClient('reorder homepage artwork');
        await client.mutation(api.ownerMutations.swapArtworkOrder, {
            currentLegacyId: currId,
            targetLegacyId: nextId,
            kind: 'homepage',
        });
        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/artwork');
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
        const client = await getAuthenticatedOwnerConvexClient('archive artwork');
        await client.mutation(api.ownerMutations.setArtworkActive, { legacyId: id, active: false });
        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/artwork');
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
        const client = await getAuthenticatedOwnerConvexClient('restore artwork');
        await client.mutation(api.ownerMutations.setArtworkActive, { legacyId: id, active: true });
        revalidatePath(`/admin/edit`);
        revalidatePath('/admin/artwork');
        revalidatePath('/admin/manage');
        revalidatePath('/admin/gallery');
        revalidatePath('/admin/slideshow');
        return { success: true };
    } catch (error) {
        console.error('Error restoring piece:', error);
        return { success: false, error: 'An error occurred while restoring the piece.' };
    }
}
