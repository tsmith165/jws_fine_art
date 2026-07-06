'use server';

import { auth } from '@clerk/nextjs/server';
import { isClerkUserIdAdmin } from '@/utils/auth/ClerkUtils';

import { db, piecesTable, extraImagesTable, progressImagesTable } from '@/db/db';
import { eq, isNull } from 'drizzle-orm';
import { createSmallerImage } from '@/utils/uploads/imageUtils';
import { PiecesWithImages, Pieces, ExtraImages, ProgressImages } from '@/db/schema';
import { Buffer } from 'buffer';
import { sendEmail } from '@/utils/emails/resend_utils';
import CheckoutSuccessEmail from '@/utils/emails/templates/checkoutSuccessEmail';
import { render } from '@react-email/render';
import React from 'react';
import { utapi } from '@/server/uploadthing';
import sharp from 'sharp';

import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

const ourFileRouter = {
    imageUploader: f({ image: { maxFileSize: '4MB' } }).onUploadComplete(async ({ file }) => {
        console.log('file url', file.url);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

type SmallImageTargetType = 'piece' | 'extra' | 'progress';

export interface SmallImageTarget {
    id: number;
    title: string;
    image_path: string;
    targetType: SmallImageTargetType;
}

async function checkUserRole(): Promise<{ isAdmin: boolean; error?: string | undefined }> {
    const { userId } = await auth();
    if (!userId) {
        return { isAdmin: false, error: 'User is not authenticated. Cannot edit piece.' };
    }
    console.log(`User ID: ${userId}`);
    const hasAdminRole = await isClerkUserIdAdmin(userId);
    console.log(`User hasAdminRole: ${hasAdminRole}`);
    if (!hasAdminRole) {
        return { isAdmin: false, error: 'User does not have the admin role. Cannot edit piece.' };
    }
    return { isAdmin: true };
}

export async function sendTestCheckoutEmail(testEmailData: {
    to: string;
    pieceTitle: string;
    fullName: string;
    address: string;
    pricePaid: number;
}): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const { to, pieceTitle, fullName, address, pricePaid } = testEmailData;

        const checkoutSuccessEmailTemplate = React.createElement(CheckoutSuccessEmail, {
            piece_title: pieceTitle,
            full_name: fullName,
            address,
            price_paid: pricePaid,
        });
        const emailHtml = await render(checkoutSuccessEmailTemplate);

        // Split the comma-separated email addresses into an array
        const recipients = to.split(',').map((email) => email.trim());

        await sendEmail({
            from: 'contact@jwsfineart.com',
            to: recipients,
            subject: 'Test Purchase Confirmation - JWS Fine Art Gallery',
            html: emailHtml,
        });
        return { success: true };
    } catch (error) {
        console.error('Error in sendTestCheckoutEmail:', error);
        return { success: false, error: 'An error occurred while processing your request.' };
    }
}

export async function getImagesMissingSmallImages(): Promise<{ success: boolean; images?: SmallImageTarget[]; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const piecesWithoutSmallImages = await db.select().from(piecesTable).where(isNull(piecesTable.small_image_path)).execute();
        const extraImagesWithoutSmallImages = await db
            .select()
            .from(extraImagesTable)
            .where(isNull(extraImagesTable.small_image_path))
            .execute();
        const progressImagesWithoutSmallImages = await db
            .select()
            .from(progressImagesTable)
            .where(isNull(progressImagesTable.small_image_path))
            .execute();

        const images: SmallImageTarget[] = [
            ...piecesWithoutSmallImages.map((image) => ({
                id: image.id,
                title: image.title,
                image_path: image.image_path,
                targetType: 'piece' as const,
            })),
            ...extraImagesWithoutSmallImages.map((image) => ({
                id: image.id,
                title: image.title || `Extra image ${image.id}`,
                image_path: image.image_path,
                targetType: 'extra' as const,
            })),
            ...progressImagesWithoutSmallImages.map((image) => ({
                id: image.id,
                title: image.title || `Progress image ${image.id}`,
                image_path: image.image_path,
                targetType: 'progress' as const,
            })),
        ];

        return { success: true, images };
    } catch (error) {
        console.error('Error in getImagesMissingSmallImages:', error);
        return { success: false, error: 'An error occurred while fetching images.' };
    }
}

function getImageTable(targetType: SmallImageTargetType) {
    if (targetType === 'piece') return piecesTable;
    if (targetType === 'extra') return extraImagesTable;
    return progressImagesTable;
}

export async function generateMissingSmallImage(image: SmallImageTarget): Promise<{ success: boolean; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        if (!image.image_path) {
            return { success: false, error: 'Image URL is missing.' };
        }

        const table = getImageTable(image.targetType);
        const response = await fetch(image.image_path);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resizedImage = await createSmallerImage(buffer, 450);
        const resizedBuffer = await resizedImage.toBuffer();

        const file: FileEsque = new Blob([resizedBuffer], { type: 'image/jpeg' }) as FileEsque;
        file.name = `small_${image.targetType}_${image.id}.jpg`;

        const uploadResult = (await utapi.uploadFiles(file)) as UploadFileResponse;

        if ('error' in uploadResult && uploadResult.error) {
            console.error('Failed to upload small image:', uploadResult.error.message);
            return { success: false, error: 'Failed to upload small image.' };
        }

        const uploadedFile = uploadResult.data;

        if (!uploadedFile) {
            console.error('Upload succeeded but no file data returned');
            return { success: false, error: 'Upload succeeded but no file data returned.' };
        }

        const metadata = await resizedImage.metadata();

        await db
            .update(table)
            .set({
                small_image_path: uploadedFile.url,
                small_width: metadata.width,
                small_height: metadata.height,
            })
            .where(eq(table.id, image.id));

        return { success: true };
    } catch (error) {
        console.error('Error in generateMissingSmallImage:', error);
        return { success: false, error: 'An error occurred while generating a small image.' };
    }
}

export async function generateMissingSmallImages(): Promise<{
    success: boolean;
    updatedPiece?: { updatedPieces: number; updatedExtraImages: number; updatedProgressImages: number };
    error?: string;
}> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }

    try {
        const imageResult = await getImagesMissingSmallImages();
        if (!imageResult.success || !imageResult.images) {
            return { success: false, error: imageResult.error || 'Failed to fetch images.' };
        }

        let updatedPieces = 0;
        let updatedExtraImages = 0;
        let updatedProgressImages = 0;

        for (const image of imageResult.images) {
            const result = await generateMissingSmallImage(image);
            if (!result.success) continue;
            if (image.targetType === 'piece') updatedPieces++;
            else if (image.targetType === 'extra') updatedExtraImages++;
            else updatedProgressImages++;
        }

        return {
            success: true,
            updatedPiece: {
                updatedPieces,
                updatedExtraImages,
                updatedProgressImages,
            },
        };
    } catch (error) {
        console.error('Error in generateMissingSmallImages:', error);
        return { success: false, error: 'An error occurred while processing your request.' };
    }
}

export async function getPiecesToVerify(): Promise<{ success: boolean; pieces?: PiecesWithImages[]; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    try {
        const pieces = await db.select().from(piecesTable).execute();
        const extraImages = await db.select().from(extraImagesTable).execute();
        const progressImages = await db.select().from(progressImagesTable).execute();

        const piecesWithImages: PiecesWithImages[] = pieces.map((piece: Pieces) => ({
            ...piece,
            extraImages: extraImages.filter((extra: ExtraImages) => extra.piece_id === piece.id),
            progressImages: progressImages.filter((progress: ProgressImages) => progress.piece_id === piece.id),
        }));

        return {
            success: true,
            pieces: piecesWithImages,
        };
    } catch (error) {
        console.error('Error in getPiecesToVerify:', error);
        return { success: false, error: 'An error occurred while processing your request.' };
    }
}

export async function verifyImageDimensions(
    image: any,
): Promise<{ success: boolean; verifyResult?: { id: number; title: string; mainImage?: any; smallImage?: any }; error?: string }> {
    const { isAdmin, error: roleError } = await checkUserRole();
    if (!isAdmin) {
        console.error(roleError);
        return { success: false, error: roleError };
    }
    try {
        const verifyAndUpdateDimensions = async (imageUrl: string, isSmall: boolean) => {
            if (!imageUrl) return null;

            try {
                const response = await fetch(imageUrl);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                const metadata = await sharp(buffer).metadata();

                if (!metadata.width || !metadata.height) {
                    console.error(`Unable to get dimensions for image: ${imageUrl}`);
                    return null;
                }

                const updateFields = isSmall
                    ? {
                          small_width: metadata.width,
                          small_height: metadata.height,
                      }
                    : {
                          width: metadata.width,
                          height: metadata.height,
                      };

                let table;
                if ('piece_type' in image) {
                    table = piecesTable;
                } else if ('extra_image_id' in image) {
                    table = extraImagesTable;
                } else {
                    table = progressImagesTable;
                }

                await db.update(table).set(updateFields).where(eq(table.id, image.id));

                return {
                    url: imageUrl,
                    ...updateFields,
                };
            } catch (error) {
                console.error(`Error processing image ${imageUrl}:`, error);
                return null;
            }
        };

        const result = await verifyAndUpdateDimensions(image.image_path, false);
        const smallResult = image.small_image_path ? await verifyAndUpdateDimensions(image.small_image_path, true) : null;

        return {
            success: true,
            verifyResult: {
                id: image.id,
                title: image.title,
                mainImage: result,
                smallImage: smallResult,
            },
        };
    } catch (error) {
        console.error('Error in verifyImageDimensions:', error);
        return { success: false, error: 'An error occurred while processing your request.' };
    }
}

// Add these interfaces at the end of the file
interface FileEsque extends Blob {
    name: string;
    customId?: string;
}

type UploadFileResponse = {
    data: {
        key: string;
        url: string;
        name: string;
        size: number;
    } | null;
    error: {
        code: string;
        message: string;
        data: any;
    } | null;
};
