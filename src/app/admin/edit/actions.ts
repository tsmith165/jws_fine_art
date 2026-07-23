'use server';

import { revalidatePath } from 'next/cache';
import { api } from '../../../../convex/_generated/api';
import type { Pieces } from '@/types/artwork';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { ownerArtworkToLegacy } from '@/data/ownerMapper';
import { validateUploadedImageReference } from '@/lib/uploadedImageReference';
import type { ArtworkCategoryId } from '@shared/artworkCategories';
import { normalizeArtworkCategories } from '@shared/artworkCategories';
import { normalizeArtworkAvailability } from '@shared/artworkListingState';

function revalidateArtworkSurfaces(id?: number) {
    revalidatePath('/');
    revalidatePath('/gallery');
    revalidatePath('/slideshow');
    revalidatePath('/admin/edit');
    revalidatePath('/admin/artwork');
    revalidatePath('/admin/manage');
    revalidatePath('/work', 'layout');
    if (id) {
        revalidatePath(`/details/${id}`);
        revalidatePath(`/checkout/${id}`);
    }
}

interface SubmitFormData {
    piece_id: string;
    piece_title: string;
    description: string;
    piece_type: string;
    sold: boolean;
    price: string;
    instagram: string;
    width: string;
    height: string;
    real_width: string;
    real_height: string;
    theme: string;
    categories: ArtworkCategoryId[];
    available: boolean;
    framed: boolean;
    comments: string;
    image_path: string;
}

function nullableText(value: string | null | undefined) {
    const normalized = value?.trim();
    return normalized ? normalized : null;
}

function nullableNumber(value: string) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : null;
}

async function findOwnerArtwork(legacyId: number) {
    const client = await getAuthenticatedOwnerConvexClient('manage artwork');
    const artworks = await client.query(api.ownerReads.listArtworks, {});
    const artwork = artworks.find((item) => item.legacyId === legacyId);
    if (!artwork) throw new Error('Artwork not found.');
    return { client, artwork };
}

export async function onSubmitEditForm(data: SubmitFormData): Promise<{ success: boolean; error?: string }> {
    try {
        const legacyId = Number(data.piece_id);
        if (!Number.isSafeInteger(legacyId) || legacyId <= 0) throw new Error('Artwork ID is invalid.');
        if (!data.piece_title.trim()) throw new Error('Title is required.');
        const { client, artwork } = await findOwnerArtwork(legacyId);
        const listing = normalizeArtworkAvailability({ sold: data.sold, available: data.available });
        await client.mutation(api.ownerMutations.updateArtwork, {
            legacyId,
            title: data.piece_title.trim(),
            description: nullableText(data.description),
            medium: nullableText(data.piece_type),
            theme: nullableText(data.theme.replace('None, ', '')),
            categories: normalizeArtworkCategories(data.categories),
            instagramUrl: nullableText(data.instagram),
            ownerNotes: nullableText(data.comments),
            priceCents: Math.max(0, Math.round(Number(data.price || 0) * 100)),
            sold: listing.sold,
            available: listing.available,
            active: artwork.active,
            framed: data.framed,
            widthInches: nullableNumber(data.real_width),
            heightInches: nullableNumber(data.real_height),
        });
        revalidateArtworkSurfaces(legacyId);
        return { success: true };
    } catch (error) {
        console.error('Unable to update artwork.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to update artwork.' };
    }
}

interface UploadFormData {
    piece_id: string;
    image_path: string;
    width: string;
    height: string;
    small_image_path: string;
    small_width: string;
    small_height: string;
    title: string | null;
    piece_type: string;
}

export async function storeUploadedImageDetails(data: UploadFormData): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
    try {
        const artworkLegacyId = Number(data.piece_id);
        const role = data.piece_type === 'main' ? 'primary' : data.piece_type === 'progress' ? 'progress' : 'supporting';
        const client = await getAuthenticatedOwnerConvexClient('store artwork media');
        const source = validateUploadedImageReference({
            url: data.image_path,
            width: Number(data.width),
            height: Number(data.height),
        });
        const small = data.small_image_path
            ? validateUploadedImageReference({
                  url: data.small_image_path,
                  width: Number(data.small_width),
                  height: Number(data.small_height),
              })
            : null;
        await client.mutation(api.ownerMutations.storeArtworkMedia, {
            artworkLegacyId,
            role,
            title: nullableText(data.title),
            sourceUrl: source.url,
            sourceWidth: source.width,
            sourceHeight: source.height,
            smallUrl: small?.url ?? null,
            smallWidth: small?.width ?? null,
            smallHeight: small?.height ?? null,
        });
        revalidateArtworkSurfaces(artworkLegacyId);
        return { success: true, imageUrl: source.url };
    } catch (error) {
        console.error('Unable to store artwork media.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to store artwork media.' };
    }
}

function imageRole(imageType: string): 'supporting' | 'progress' {
    return imageType === 'extra' ? 'supporting' : 'progress';
}

export async function handleImageReorder(
    pieceId: number,
    currentPieceId: number,
    targetPieceId: number,
    imageType: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = await getAuthenticatedOwnerConvexClient('reorder artwork media');
        await client.mutation(api.ownerMutations.swapMediaOrder, {
            currentMediaId: currentPieceId,
            targetMediaId: targetPieceId,
            role: imageRole(imageType),
        });
        revalidateArtworkSurfaces(pieceId);
        return { success: true };
    } catch (error) {
        console.error('Unable to reorder artwork media.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to reorder artwork media.' };
    }
}

export async function handleMediaOrderUpdate(
    pieceId: number,
    mediaIds: number[],
    imageType: 'extra' | 'progress',
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = await getAuthenticatedOwnerConvexClient('reorder artwork media');
        await client.mutation(api.ownerMutations.reorderArtworkMedia, {
            artworkLegacyId: pieceId,
            mediaIds,
            role: imageRole(imageType),
        });
        revalidateArtworkSurfaces(pieceId);
        return { success: true };
    } catch (error) {
        console.error('Unable to reorder artwork media.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to reorder artwork media.' };
    }
}

export async function handleImageTitleEdit(
    imageId: number,
    newTitle: string,
    imageType: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const client = await getAuthenticatedOwnerConvexClient('edit artwork media');
        await client.mutation(api.ownerMutations.updateMediaTitle, {
            mediaId: imageId,
            role: imageRole(imageType),
            title: nullableText(newTitle),
        });
        revalidatePath('/admin/edit');
        return { success: true };
    } catch (error) {
        console.error('Unable to update image title.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to update image title.' };
    }
}

export async function handleImageDelete(
    pieceId: number,
    imagePath: string,
    imageType: string,
): Promise<{ success: boolean; error?: string }> {
    try {
        const { client, artwork } = await findOwnerArtwork(pieceId);
        const role = imageRole(imageType);
        const media = artwork.media.find((item) => item.role === role && item.sourceUrl === imagePath);
        if (!media) throw new Error('Artwork image not found.');
        await client.mutation(api.ownerMutations.archiveMedia, { mediaId: media.legacyId, role });
        revalidateArtworkSurfaces(pieceId);
        return { success: true };
    } catch (error) {
        console.error('Unable to archive artwork media.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to archive artwork media.' };
    }
}

export async function handleTitleUpdate(formData: FormData): Promise<{ success: boolean; error?: string }> {
    const pieceId = Number(formData.get('pieceId'));
    const newTitle = formData.get('newTitle')?.toString().trim();
    if (!pieceId || !newTitle) return { success: false, error: 'Artwork ID and title are required.' };
    try {
        const { client, artwork } = await findOwnerArtwork(pieceId);
        await client.mutation(api.ownerMutations.updateArtwork, {
            legacyId: pieceId,
            title: newTitle,
            description: artwork.description,
            medium: artwork.medium,
            theme: artwork.theme,
            categories: artwork.categories,
            instagramUrl: artwork.instagramUrl,
            ownerNotes: artwork.ownerNotes,
            priceCents: artwork.priceCents,
            sold: artwork.sold,
            available: artwork.available,
            active: artwork.active,
            framed: artwork.framed,
            widthInches: artwork.widthInches,
            heightInches: artwork.heightInches,
        });
        revalidateArtworkSurfaces(pieceId);
        return { success: true };
    } catch (error) {
        console.error('Unable to update artwork title.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to update artwork title.' };
    }
}

interface NewPieceData {
    title: string;
    imagePath: string;
    width: number;
    height: number;
    smallImagePath: string;
    smallWidth: number;
    smallHeight: number;
}

export async function createPiece(newPieceData: NewPieceData): Promise<{ success: boolean; piece?: Pieces; error?: string }> {
    try {
        if (!newPieceData.title.trim()) throw new Error('Artwork title is required.');
        const client = await getAuthenticatedOwnerConvexClient('create artwork');
        const source = validateUploadedImageReference({
            url: newPieceData.imagePath,
            width: newPieceData.width,
            height: newPieceData.height,
        });
        const small = newPieceData.smallImagePath
            ? validateUploadedImageReference({
                  url: newPieceData.smallImagePath,
                  width: newPieceData.smallWidth,
                  height: newPieceData.smallHeight,
              })
            : null;
        const created = await client.mutation(api.ownerMutations.createArtwork, {
            title: newPieceData.title.trim(),
            description: null,
            medium: null,
            theme: null,
            categories: [],
            instagramUrl: null,
            ownerNotes: null,
            priceCents: 0,
            sold: false,
            available: false,
            active: true,
            framed: false,
            widthInches: null,
            heightInches: null,
            primaryImage: {
                sourceUrl: source.url,
                sourceWidth: source.width,
                sourceHeight: source.height,
                smallUrl: small?.url ?? null,
                smallWidth: small?.width ?? null,
                smallHeight: small?.height ?? null,
            },
        });
        const artworks = await client.query(api.ownerReads.listArtworks, {});
        const artwork = artworks.find((item) => item.legacyId === created.legacyId);
        if (!artwork) throw new Error('The new artwork could not be reloaded.');
        revalidateArtworkSurfaces(created.legacyId);
        return { success: true, piece: ownerArtworkToLegacy(artwork) };
    } catch (error) {
        console.error('Unable to create artwork.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to create artwork.' };
    }
}

export async function createNewPiece(newPieceData: NewPieceData) {
    return createPiece(newPieceData);
}
