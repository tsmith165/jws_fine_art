'use server';
import { db, piecesTable } from '@/db/db';
import { eq, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getMostRecentId } from '@/app/actions';

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
    extra_images: string;
    progress_images: string;
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
                extra_images: data.extra_images || '[]',
                progress_images: data.progress_images || '[]',
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
        const jsonImages = imageType === 'extra' ? piece[0].extra_images : piece[0].progress_images;
        const images = JSON.parse(jsonImages as string) as ImageData[];
        const width = parseInt(data.width?.toString() || '0');
        const height = parseInt(data.height?.toString() || '0');
        images.push({ image_path: imageUrl, width: width, height: height });

        await db
            .update(piecesTable)
            .set({ [imageType]: JSON.stringify(images) })
            .where(eq(piecesTable.id, pieceId));
    }

    revalidatePath(`/edit/${piece[0].o_id}`);
    return imageUrl;
}

interface ImageData {
    image_path: string;
    width: number;
    height: number;
}

export async function handleImageReorder(pieceId: number, index: number, direction: string, imageType: string) {
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.id, pieceId)).limit(1);
    if (!piece.length) {
        console.error(`Piece with id ${pieceId} not found`);
        return;
    }

    const jsonImages = imageType === 'extra' ? piece[0].extra_images : piece[0].progress_images;
    const images = JSON.parse(jsonImages as string) as ImageData[];

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const item = images[index];
    images.splice(index, 1);
    images.splice(newIndex, 0, item);

    await db
        .update(piecesTable)
        .set({ [imageType]: JSON.stringify(images) })
        .where(eq(piecesTable.id, pieceId));

    revalidatePath(`/edit/${piece[0].o_id}`);
}

interface NewPieceData {
    title: string;
    imagePath: string;
    width: number;
    height: number;
}

export async function handleImageDeleteAction(pieceId: number, imagePath: string, imageType: string) {
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.id, pieceId)).limit(1);
    if (!piece.length) {
        console.error(`Piece with id ${pieceId} not found`);
        return;
    }

    const jsonImages = imageType === 'extra' ? piece[0].extra_images : piece[0].progress_images;
    const images = JSON.parse(jsonImages as string) as ImageData[];
    const updatedImages = images.filter((image) => image.image_path !== imagePath);

    await db
        .update(piecesTable)
        .set({ [imageType]: JSON.stringify(updatedImages) })
        .where(eq(piecesTable.id, pieceId));

    revalidatePath(`/edit/${piece[0].o_id}`);
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
