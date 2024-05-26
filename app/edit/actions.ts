'use server';
import { db, piecesTable, extraImagesTable, progressImagesTable } from '@/db/db';
import { eq, and, desc } from 'drizzle-orm';
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
}

export async function onSubmitEditForm(data: SubmitFormData) {
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
    revalidatePath(`/edit/${data.piece_id}`);
}

interface UploadFormData {
    piece_id: string;
    image_path: string;
    title: string | null; // Make title nullable
    piece_type: string;
    width: string;
    height: string;
}

export async function handleImageUpload(data: UploadFormData) {
    console.log('Uploading Image...');
    const pieceId = parseInt(data.piece_id?.toString() || '0');
    const imageUrl = data.image_path?.toString() || '';
    const title = data.title;
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
                title: title, // Set the title
                width: width,
                height: height,
            });
        } else if (imageType === 'progress') {
            await db.insert(progressImagesTable).values({
                piece_id: pieceId,
                image_path: imageUrl,
                title: title, // Set the title
                width: width,
                height: height,
            });
        }
    }

    revalidatePath(`/edit/${piece[0].id}`);
    return imageUrl;
}

export async function handleImageReorder(pieceId: number, currentPieceId: number, targetPieceId: number, imageType: string) {
    const table = imageType === 'extra' ? extraImagesTable : progressImagesTable;

    const currentImage = await db.select().from(table).where(eq(table.id, currentPieceId)).limit(1);
    const targetImage = await db.select().from(table).where(eq(table.id, targetPieceId)).limit(1);

    if (currentImage.length === 0 || targetImage.length === 0) {
        console.error(`No images found for reordering`);
        return;
    }

    console.log(`Setting image path for ${currentPieceId} to ${targetImage[0].image_path}`);
    await db.update(table).set({ image_path: targetImage[0].image_path }).where(eq(table.id, currentPieceId));

    console.log(`Setting image path for ${targetPieceId} to ${currentImage[0].image_path}`);
    await db.update(table).set({ image_path: currentImage[0].image_path }).where(eq(table.id, targetPieceId));

    // Revalidate the path to refetch the data
    revalidatePath(`/edit/${pieceId}`);
}

export async function handleImageTitleEdit(imageId: number, newTitle: string, imageType: string) {
    const table = imageType === 'extra' ? extraImagesTable : progressImagesTable;

    await db.update(table).set({ title: newTitle }).where(eq(table.id, imageId));

    // Revalidate the path to refetch the data
    revalidatePath(`/edit/${imageId}`);
}

export async function handleImageDeleteAction(pieceId: number, imagePath: string, imageType: string) {
    const deleteTable = imageType === 'extra' ? extraImagesTable : progressImagesTable;
    await db.delete(deleteTable).where(and(eq(deleteTable.piece_id, pieceId), eq(deleteTable.image_path, imagePath)));

    // Revalidate the path to refetch the data
    revalidatePath(`/edit/${pieceId}`);
}

export async function handleTitleUpdate(formData: FormData) {
    const pieceId = Number(formData.get('pieceId'));
    const newTitle = formData.get('newTitle')?.toString();

    if (!pieceId || !newTitle) {
        console.error('Required form data missing. Cannot update title.');
        return;
    }

    await db.update(piecesTable).set({ title: newTitle }).where(eq(piecesTable.id, pieceId));

    // Revalidate the path to refetch the data
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
