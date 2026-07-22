'use server';

import { revalidatePath } from 'next/cache';
import { api } from '../../../../convex/_generated/api';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';

export async function saveHomepageRotation(
    artworkLegacyIds: number[],
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = await getAuthenticatedOwnerConvexClient('update homepage rotation');
        await client.mutation(api.ownerMutations.setHomepageRotation, { artworkLegacyIds });
        revalidatePath('/');
        revalidatePath('/admin');
        revalidatePath('/admin/homepage');
        return { success: true };
    } catch (error) {
        console.error('Unable to update the homepage rotation.', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unable to update the homepage rotation.',
        };
    }
}
