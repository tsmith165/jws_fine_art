'use server';

import React from 'react';
import { render } from '@react-email/render';
import sharp from 'sharp';
import { api } from '../../../../convex/_generated/api';
import type { PiecesWithImages } from '@/types/artwork';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { ownerArtworkWithMediaToLegacy } from '@/data/ownerMapper';
import { sendEmail } from '@/utils/emails/resend_utils';
import CheckoutSuccessEmail from '@/utils/emails/templates/checkoutSuccessEmail';

type SmallImageTargetType = 'piece' | 'extra' | 'progress';

export interface SmallImageTarget {
    id: number;
    title: string;
    image_path: string;
    targetType: SmallImageTargetType;
}

export async function sendTestCheckoutEmail(testEmailData: {
    to: string;
    pieceTitle: string;
    fullName: string;
    address: string;
    pricePaid: number;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await getAuthenticatedOwnerConvexClient('send a test email');
        const recipients = testEmailData.to
            .split(',')
            .map((email) => email.trim())
            .filter(Boolean);
        if (recipients.length === 0) throw new Error('At least one recipient is required.');
        const emailHtml = await render(
            React.createElement(CheckoutSuccessEmail, {
                piece_title: testEmailData.pieceTitle,
                full_name: testEmailData.fullName,
                address: testEmailData.address,
                price_paid: testEmailData.pricePaid,
            }),
        );
        await sendEmail({
            from: 'contact@jwsfineart.com',
            to: recipients,
            subject: 'Test Purchase Confirmation - JWS Fine Art Gallery',
            html: emailHtml,
        });
        return { success: true };
    } catch (error) {
        console.error('Unable to send test checkout email.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to send test email.' };
    }
}

// Responsive derivatives are generated at delivery time. Original files remain the preservation source.
export async function getImagesMissingSmallImages(): Promise<{ success: boolean; images?: SmallImageTarget[]; error?: string }> {
    await getAuthenticatedOwnerConvexClient('review image derivatives');
    return { success: true, images: [] };
}

export async function generateMissingSmallImage(_image: SmallImageTarget): Promise<{ success: boolean; error?: string }> {
    await getAuthenticatedOwnerConvexClient('review image derivatives');
    return { success: true };
}

export async function generateMissingSmallImages(): Promise<{
    success: boolean;
    updatedPiece?: { updatedPieces: number; updatedExtraImages: number; updatedProgressImages: number };
    error?: string;
}> {
    await getAuthenticatedOwnerConvexClient('review image derivatives');
    return { success: true, updatedPiece: { updatedPieces: 0, updatedExtraImages: 0, updatedProgressImages: 0 } };
}

export async function getPiecesToVerify(): Promise<{ success: boolean; pieces?: PiecesWithImages[]; error?: string }> {
    try {
        const client = await getAuthenticatedOwnerConvexClient('verify image metadata');
        const artworks = await client.query(api.ownerReads.listArtworks, {});
        return { success: true, pieces: artworks.map(ownerArtworkWithMediaToLegacy) };
    } catch (error) {
        console.error('Unable to load image metadata.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to load image metadata.' };
    }
}

async function dimensions(url: string | null) {
    if (!url) return null;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Image request failed with ${response.status}.`);
    const metadata = await sharp(Buffer.from(await response.arrayBuffer()), { failOn: 'error' }).metadata();
    if (!metadata.width || !metadata.height) throw new Error('Image dimensions are unavailable.');
    return { width: metadata.width, height: metadata.height };
}

export async function verifyImageDimensions(image: PiecesWithImages): Promise<{
    success: boolean;
    verifyResult?: { id: number; title: string; mainImage?: unknown; smallImage?: unknown };
    error?: string;
}> {
    try {
        const client = await getAuthenticatedOwnerConvexClient('verify image metadata');
        const artworks = await client.query(api.ownerReads.listArtworks, {});
        const artwork = artworks.find((item) => item.legacyId === image.id);
        const primary = artwork?.media.find((item) => item.role === 'primary');
        if (!primary) throw new Error('Primary image not found.');
        const [main, small] = await Promise.all([dimensions(primary.sourceUrl), dimensions(primary.smallUrl)]);
        if (!main) throw new Error('Primary image dimensions are unavailable.');
        await client.mutation(api.ownerMutations.updateMediaDimensions, {
            mediaId: primary.legacyId,
            role: 'primary',
            sourceWidth: main.width,
            sourceHeight: main.height,
            smallWidth: small?.width ?? null,
            smallHeight: small?.height ?? null,
        });
        return {
            success: true,
            verifyResult: {
                id: image.id,
                title: image.title,
                mainImage: { url: primary.sourceUrl, width: main.width, height: main.height },
                smallImage: small ? { url: primary.smallUrl, width: small.width, height: small.height } : null,
            },
        };
    } catch (error) {
        console.error('Unable to verify image dimensions.', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unable to verify image dimensions.' };
    }
}
