'use server';

import { db, piecesTable, extraImagesTable, progressImagesTable } from '@/db/db';
import { eq, isNull } from 'drizzle-orm';
import { createSmallerImage } from '@/utils/imageUtils';
import { fetchPieces } from '@/app/actions';
import ExcelJS from 'exceljs';
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

export async function exportPieces(): Promise<Buffer> {
    const pieces = await fetchPieces();

    if (pieces.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Pieces');

        worksheet.columns = Object.keys(pieces[0]).map((key) => ({ header: key, key }));
        pieces.forEach((piece) => worksheet.addRow(piece));

        const uint8Array = await workbook.xlsx.writeBuffer();
        const buffer = Buffer.from(uint8Array);

        return buffer;
    } else {
        throw new Error('No pieces found to export');
    }
}

export async function sendTestCheckoutEmail(testEmailData: {
    to: string;
    pieceTitle: string;
    fullName: string;
    address: string;
    pricePaid: number;
}): Promise<void> {
    const { to, pieceTitle, fullName, address, pricePaid } = testEmailData;

    const checkoutSuccessEmailTemplate = React.createElement(CheckoutSuccessEmail, {
        piece_title: pieceTitle,
        full_name: fullName,
        address,
        price_paid: pricePaid,
    });
    const emailHtml = render(checkoutSuccessEmailTemplate);

    // Split the comma-separated email addresses into an array
    const recipients = to.split(',').map((email) => email.trim());

    await sendEmail({
        from: 'contact@jwsfineart.com',
        to: recipients,
        subject: 'Test Purchase Confirmation - JWS Fine Art Gallery',
        html: emailHtml,
    });
}

export async function generateMissingSmallImages(progressCallback?: (piece: any, current: number, total: number) => Promise<boolean>) {
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

    const allImages = [...piecesWithoutSmallImages, ...extraImagesWithoutSmallImages, ...progressImagesWithoutSmallImages];
    let updatedPieces = 0;
    let updatedExtraImages = 0;
    let updatedProgressImages = 0;

    const updateImage = async (
        image: any,
        table: typeof piecesTable | typeof extraImagesTable | typeof progressImagesTable,
        index: number,
    ) => {
        if (!image.image_path) return;

        if (progressCallback) {
            const shouldStop = await progressCallback(image, index + 1, allImages.length);
            if (shouldStop) return;
        }

        const response = await fetch(image.image_path);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Resize the image
        const resizedImage = await createSmallerImage(buffer, 450);
        const resizedBuffer = await resizedImage.toBuffer();

        // Create a File-like object
        const file: FileEsque = new Blob([resizedBuffer], { type: 'image/jpeg' }) as FileEsque;
        file.name = `small_${image.id}.jpg`;

        // Upload the resized image using UploadThing
        const uploadResult = (await utapi.uploadFiles(file)) as UploadFileResponse;

        if ('error' in uploadResult && uploadResult.error) {
            throw new Error(`Failed to upload small image: ${uploadResult.error.message}`);
        }

        const uploadedFile = uploadResult.data;

        if (!uploadedFile) {
            throw new Error('Upload succeeded but no file data returned');
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

        if (table === piecesTable) updatedPieces++;
        else if (table === extraImagesTable) updatedExtraImages++;
        else if (table === progressImagesTable) updatedProgressImages++;
    };

    for (let i = 0; i < allImages.length; i++) {
        const image = allImages[i];
        let table;
        if ('piece_type' in image) {
            table = piecesTable;
        } else if ('extra_image_id' in image) {
            table = extraImagesTable;
        } else {
            table = progressImagesTable;
        }
        await updateImage(image, table, i);
    }

    return {
        updatedPieces,
        updatedExtraImages,
        updatedProgressImages,
    };
}

export async function getPiecesToVerify() {
    const pieces = await db.select().from(piecesTable).execute();
    const extraImages = await db.select().from(extraImagesTable).execute();
    const progressImages = await db.select().from(progressImagesTable).execute();

    return [...pieces, ...extraImages, ...progressImages];
}

export async function verifyImageDimensions(image: any) {
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
        id: image.id,
        title: image.title,
        mainImage: result,
        smallImage: smallResult,
    };
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
