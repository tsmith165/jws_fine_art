'use server';

import { revalidatePath } from 'next/cache';
import { api } from '../../../../convex/_generated/api';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { normalizeArtworkCategories, type ArtworkCategoryId } from '@shared/artworkCategories';

export async function saveArtworkCategories(
    legacyId: number,
    values: ArtworkCategoryId[],
): Promise<{ success: boolean; categories?: ArtworkCategoryId[]; error?: string }> {
    try {
        if (!Number.isSafeInteger(legacyId) || legacyId <= 0) throw new Error('Artwork ID is invalid.');
        const categories = normalizeArtworkCategories(values);
        const client = await getAuthenticatedOwnerConvexClient('categorize artwork');
        await client.mutation(api.ownerMutations.setArtworkCategories, { legacyId, categories });

        revalidatePath('/');
        revalidatePath('/work');
        revalidatePath('/admin');
        revalidatePath('/admin/artwork');
        revalidatePath('/admin/categories');
        revalidatePath('/admin/edit');
        return { success: true, categories };
    } catch (error) {
        console.error('Unable to update artwork categories.', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unable to update artwork categories.',
        };
    }
}

export async function saveArtworkFramedDimensions(input: {
    legacyId: number;
    framedWidthInches: number;
    framedHeightInches: number;
    verified: boolean;
}) {
    try {
        const client = await getAuthenticatedOwnerConvexClient('verify framed artwork dimensions');
        await client.mutation(api.ownerMutations.setArtworkFramedDimensions, input);
        revalidatePath('/');
        revalidatePath('/work');
        revalidatePath('/admin');
        revalidatePath('/admin/artwork');
        revalidatePath('/admin/categories');
        revalidatePath('/admin/edit');
        revalidatePath('/viewing-room');
        return { success: true as const };
    } catch (error) {
        return {
            success: false as const,
            error: error instanceof Error ? error.message : 'Unable to save framed dimensions.',
        };
    }
}
