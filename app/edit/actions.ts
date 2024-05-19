'use server';
import { db, piecesTable, extraImagesTable, progressImagesTable } from '@/db/db';
import { eq, desc, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getMostRecentId } from '@/app/actions';
import { PiecesWithImages } from '@/db/schema';

interface SubmitFormData {
    piece_id: string;
    piece_title: string;
    description: string;
    piece_type: string;
    sold: string;
    price: string;
    instagram: string;
    width: string;
    height: string;
    real_width: string;
    real_height: string;
    theme: string;
    available: string;
    framed: string;
    comments: string;
    image_path: string;
}

export async function onSubmit(data: SubmitFormData) {
    console.log('Form Data (Next Line):');
    console.log(data);

    if (!data.piece_title) {
        throw new Error('Title is required');
    }

    if (data.piece_id) {
        // Update existing piece
        await db
            .update(piecesTable)
            .set({
                title: data.piece_title?.toString(),
                width: parseInt(data.width || '0'),
                height: parseInt(data.height || '0'),
                description: data.description || '',
                piece_type: data.piece_type || '',
                sold: data.sold === 'Sold',
                price: parseInt(data.price || '0'),
                real_width: parseInt(data.real_width || '0'),
                real_height: parseInt(data.real_height || '0'),
                instagram: data.instagram?.split('/').pop() || '',
                theme: data.theme?.replace('None, ', '') || '',
                available: data.available === 'True',
                framed: data.framed === 'True',
                comments: data.comments || '',
                image_path: data.image_path || '',
            })
            .where(eq(piecesTable.id, parseInt(data.piece_id)));
    } else {
        // Create new piece
        const last_oid_json = await db
            .select()
            .from(piecesTable)
            .where(eq(piecesTable.active, true))
            .orderBy(desc(piecesTable.o_id))
            .limit(1);
        const last_oid = last_oid_json[0]?.o_id || 0;
        const next_oid = last_oid + 1;
        const next_id = last_oid + 1;

        await db.insert(piecesTable).values({
            id: next_id,
            o_id: next_oid,
            class_name: data.piece_title.toString().toLowerCase().replace(' ', '_'),
            title: data.piece_title?.toString(),
            image_path: data.image_path || '',
            width: parseInt(data.width || '0'),
            height: parseInt(data.height || '0'),
            description: data.description || '',
            piece_type: data.piece_type || '',
            sold: data.sold === 'Sold',
            price: parseInt(data.price || '0'),
            real_width: parseInt(data.real_width || '0'),
            real_height: parseInt(data.real_height || '0'),
            active: true,
            instagram: data.instagram?.split('/').pop() || '',
            theme: data.theme?.replace('None, ', '') || '',
            available: data.available === 'True',
            framed: data.framed === 'True',
            comments: data.comments || '',
        });
    }
}

interface UploadFormData {
    piece_id: string;
    image_path: string;
    piece_type: string;
    width: string;
    height: string;
}

export async function handleImageUpload(data: UploadFormData) {
    console.log('Uploading Image...');
    const pieceId = parseInt(data.piece_id?.toString() || '0');
    const imageUrl = data.image_path?.toString() || '';
    const imageType = data.piece_type?.toString() || '';

    const piece = await db.select().from(piecesTable).where(eq(piecesTable.id, pieceId)).limit(1);
    if (!piece.length) {
        console.error(`Piece with id ${pieceId} not found`);
        return;
    }

    if (imageType === 'main') {
        // Modify the current main image
        await db.update(piecesTable).set({ image_path: imageUrl }).where(eq(piecesTable.id, pieceId));
    } else {
        // Add a new extra or progress image
        const width = parseInt(data.width?.toString() || '0');
        const height = parseInt(data.height?.toString() || '0');

        if (imageType === 'extra') {
            await db.insert(extraImagesTable).values({
                piece_id: pieceId,
                image_path: imageUrl,
                width: width,
                height: height,
            });
        } else if (imageType === 'progress') {
            await db.insert(progressImagesTable).values({
                piece_id: pieceId,
                image_path: imageUrl,
                width: width,
                height: height,
            });
        }
    }

    revalidatePath(`/edit/${piece[0].o_id}`);
    return imageUrl;
}

export async function handleImageReorder(pieceId: number, index: number, direction: string, imageType: string) {
    let images;
    if (imageType === 'extra') {
        images = await db.select().from(extraImagesTable).where(eq(extraImagesTable.piece_id, pieceId));
    } else {
        images = await db.select().from(progressImagesTable).where(eq(progressImagesTable.piece_id, pieceId));
    }

    if (images.length === 0) {
        console.error(`No images found for piece with id ${pieceId}`);
        return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const item = images[index];
    images.splice(index, 1);
    images.splice(newIndex, 0, item);

    const updateTable = imageType === 'extra' ? extraImagesTable : progressImagesTable;
    await db.update(updateTable).set({ image_path: images[newIndex].image_path }).where(eq(updateTable.id, images[newIndex].id));
    await db.update(updateTable).set({ image_path: item.image_path }).where(eq(updateTable.id, item.id));

    revalidatePath(`/edit/${pieceId}`);
}

export async function handleImageDeleteAction(pieceId: number, imagePath: string, imageType: string) {
    const deleteTable = imageType === 'extra' ? extraImagesTable : progressImagesTable;
    await db.delete(deleteTable).where(and(eq(deleteTable.piece_id, pieceId), eq(deleteTable.image_path, imagePath)));

    revalidatePath(`/edit/${pieceId}`);
}

interface NewPieceData {
    title: string;
    imagePath: string;
    width: number;
    height: number;
}

export async function createPiece(newPieceData: NewPieceData) {
    const { title, imagePath, width, height } = newPieceData;

    // Find the maximum o_id value from existing pieces
    const maxOId = await getMostRecentId();
    const newOId = maxOId ? maxOId + 1 : 1;

    const data = {
        title: title,
        image_path: imagePath,
        width: width,
        height: height,
        description: '',
        piece_type: '',
        sold: false,
        price: 0,
        real_width: 0,
        real_height: 0,
        active: true,
        instagram: '',
        theme: '',
        available: true,
        framed: false,
        comments: '',
        o_id: newOId,
        class_name: title.toString().toLowerCase().replace(' ', '_').replace('-', '_'),
    };

    const newPiece = await db.insert(piecesTable).values(data).returning();
    return newPiece[0];
}
