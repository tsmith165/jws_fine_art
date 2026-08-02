'use server';

import { revalidatePath } from 'next/cache';
import type { Id } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';

export type GalleryWallInput = {
    wallId?: string;
    expectedRevision?: number;
    title: string;
    narrative: string;
    widthInches: number;
    heightInches: number;
    background: { kind: 'preset'; preset: 'white-oak' | 'warm-plaster' | 'museum-green' | 'charcoal' | 'midnight' };
    floorStyle: 'oak' | 'concrete' | 'none';
    lighting: 'gallery' | 'daylight' | 'soft';
    placements: Array<{ id: string; artworkLegacyId: number; centerXInches: number; centerYInches: number }>;
};

function revalidateWalls(slug?: string) {
    revalidatePath('/admin/walls');
    revalidatePath('/viewing-room');
    revalidatePath('/sitemap.xml');
    revalidatePath('/');
    if (slug) revalidatePath(`/viewing-room/${slug}`);
}

export async function saveGalleryWall(input: GalleryWallInput) {
    try {
        const client = await getAuthenticatedOwnerConvexClient('save a gallery wall');
        const result = await client.mutation(api.galleryWalls.saveWall, {
            ...input,
            wallId: input.wallId as Id<'galleryWalls'> | undefined,
            narrative: input.narrative.trim() || null,
        });
        revalidateWalls(result.slug);
        return { success: true as const, ...result };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : 'The wall could not be saved.' };
    }
}

export async function publishGalleryWall(wallId: string) {
    try {
        const client = await getAuthenticatedOwnerConvexClient('publish a gallery wall');
        const result = await client.mutation(api.galleryWalls.publishWall, { wallId: wallId as Id<'galleryWalls'> });
        revalidateWalls(result.slug);
        return { success: true as const, ...result };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : 'The wall could not be published.' };
    }
}

export async function archiveGalleryWall(wallId: string) {
    try {
        const client = await getAuthenticatedOwnerConvexClient('archive a gallery wall');
        await client.mutation(api.galleryWalls.archiveWall, { wallId: wallId as Id<'galleryWalls'> });
        revalidateWalls();
        return { success: true as const };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : 'The wall could not be archived.' };
    }
}

export async function unpublishGalleryWall(wallId: string) {
    try {
        const client = await getAuthenticatedOwnerConvexClient('unpublish a gallery wall');
        const result = await client.mutation(api.galleryWalls.unpublishWall, { wallId: wallId as Id<'galleryWalls'> });
        revalidateWalls(result.slug);
        return { success: true as const };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : 'The wall could not be unpublished.' };
    }
}

export async function duplicateGalleryWall(wallId: string) {
    try {
        const client = await getAuthenticatedOwnerConvexClient('duplicate a gallery wall');
        const result = await client.mutation(api.galleryWalls.duplicateWall, { wallId: wallId as Id<'galleryWalls'> });
        revalidateWalls(result.slug);
        return { success: true as const, ...result };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : 'The wall could not be duplicated.' };
    }
}

export async function moveGalleryWall(wallId: string, direction: 'up' | 'down') {
    try {
        const client = await getAuthenticatedOwnerConvexClient('reorder gallery walls');
        await client.mutation(api.galleryWalls.moveWall, { wallId: wallId as Id<'galleryWalls'>, direction });
        revalidateWalls();
        return { success: true as const };
    } catch (error) {
        return { success: false as const, error: error instanceof Error ? error.message : 'The wall could not be reordered.' };
    }
}
