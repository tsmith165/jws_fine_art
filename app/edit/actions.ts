'use server';
import { prisma } from '@/lib/prisma';
import { Piece } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { generate_upload_url } from '@/lib/s3_api_calls';
import axios from 'axios';

export async function onSubmit(data: FormData) {
    const piece_id = data.get('piece_id')?.toString();
    const title = data.get('title')?.toString();
    if (!title) {
        throw new Error('Title is required');
    }
    const description = data.get('description')?.toString() || '';
    const piece_type = data.get('piece_type')?.toString() || '';
    const sold = data.get('sold')?.toString() === 'Sold';
    const price = parseInt(data.get('price')?.toString() || '0');
    const instagram = data.get('instagram')?.toString().split('/').pop() || '';
    const width = parseInt(data.get('width')?.toString() || '0');
    const height = parseInt(data.get('height')?.toString() || '0');
    const real_width = parseInt(data.get('real_width')?.toString() || '0');
    const real_height = parseInt(data.get('real_height')?.toString() || '0');
    const theme = data.get('theme')?.toString().replace('None, ', '') || '';
    const available = data.get('available')?.toString() === 'True';
    const framed = data.get('framed')?.toString() === 'True';
    const comments = data.get('comments')?.toString() || '';
    const image_path = data.get('image_path')?.toString() || '';
    const extra_images = data.get('extra_images')?.toString() || '[]';
    const progress_images = data.get('progress_images')?.toString() || '[]';

    if (piece_id) {
        // Update existing piece
        await prisma.piece.update({
            where: { id: parseInt(piece_id) },
            data: {
                title,
                width,
                height,
                description,
                piece_type,
                sold,
                price,
                real_width,
                real_height,
                instagram,
                theme,
                available,
                framed,
                comments,
                image_path,
                extra_images,
                progress_images,
            },
        });
    } else {
        // Create new piece
        const last_oid_json = await prisma.$queryRaw<{ max: string | null }[]>`select max(o_id) from "Piece"`;
        const last_oid = parseInt(last_oid_json[0].max || '0');
        const next_oid = last_oid + 1;
        const next_id = last_oid + 1;

        await prisma.piece.create({
            data: {
                id: next_id,
                o_id: next_oid,
                class_name: title.toString().toLowerCase().replace(' ', '_'),
                title,
                image_path,
                width,
                height,
                description,
                piece_type,
                sold,
                price,
                real_width,
                real_height,
                active: true,
                instagram,
                theme,
                available,
                framed,
                comments,
            },
        });
    }
}

export async function onFileUpload(data: FormData) {
    const selected_file = data.get('file') as File;
    const file_upload_type = data.get('file_upload_type')?.toString() || '';
    const piece_title = data.get('piece_title')?.toString() || '';

    if (!selected_file) return;

    let file_name = selected_file.name.replace(/\s+/g, '_'); // Replace spaces with underscore
    const file_extension = file_name.split('.').pop()?.toLowerCase() || '';
    const title = piece_title.toLowerCase().replace(/\s+/g, '_'); // Replace spaces with underscore

    if (file_upload_type === 'extra') {
        const current_index = parseInt(data.get('extra_images_count')?.toString() || '0') + 1;
        file_name = `${title}_extra_${current_index}`;
    }
    if (file_upload_type === 'progress') {
        const current_index = parseInt(data.get('progress_images_count')?.toString() || '0') + 1;
        file_name = `${title}_progress_${current_index}`;
    }
    if (file_upload_type === 'cover') {
        file_name = `${title}`;
    }

    const file_name_with_extension = `${file_name}.${file_extension}`;

    const s3_upload_url = await generate_upload_url(file_name_with_extension, file_upload_type);

    // Upload image to S3
    await axios.put(s3_upload_url, selected_file, {
        headers: {
            'Content-Type': 'image/jpeg',
        },
    });

    const uploaded_image_path = s3_upload_url.split('?')[0];
    return uploaded_image_path;
}

interface ImageData {
    image_path: string;
}

export async function handleImageReorder(pieceId: number, index: number, direction: string, imageType: string) {
    const piece = await prisma.piece.findUnique({ where: { id: pieceId } });
    if (!piece) {
        console.error(`Piece with id ${pieceId} not found`);
        return;
    }
    const images = JSON.parse(piece[imageType as keyof Piece] as string) as ImageData[];

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const item = images[index];
    images.splice(index, 1);
    images.splice(newIndex, 0, item);

    await prisma.piece.update({
        where: { id: pieceId },
        data: { [imageType]: JSON.stringify(images) },
    });

    revalidatePath(`/edit/${piece.o_id}`);
}

interface NewPieceData {
    title: string;
    imagePath: string;
}

export async function createPiece(newPieceData: NewPieceData) {
    const { title, imagePath } = newPieceData;

    // Find the maximum o_id value from existing pieces
    const maxOId = await prisma.piece.aggregate({
        _max: {
            o_id: true,
        },
    });

    const newOId = (maxOId._max.o_id || 0) + 1;

    const newPiece = await prisma.piece.create({
        data: {
            title,
            image_path: imagePath,
            width: 0,
            height: 0,
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
            class_name: '',
        },
    });

    return newPiece;
}
