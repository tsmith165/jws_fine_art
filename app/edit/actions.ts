'use server';
import { prisma } from '@/lib/prisma';
import { Piece } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { generate_upload_url } from '@/lib/s3_api_calls';
import axios from 'axios';
import { Upload } from 'aws-sdk/clients/devicefarm';

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
    const piece_id = data.piece_id?.toString();
    const title = data.piece_title?.toString();
    if (!title) {
        throw new Error('Title is required');
    }
    const description = data.description || '';
    const piece_type = data.piece_type || '';
    const sold = data.sold === 'Sold';
    const price = parseInt(data.price || '0');
    const instagram = data.instagram?.split('/').pop() || '';
    const width = parseInt(data.width || '0');
    const height = parseInt(data.height || '0');
    const real_width = parseInt(data.real_width || '0');
    const real_height = parseInt(data.real_height || '0');
    const theme = data.theme?.replace('None, ', '') || '';
    const available = data.available === 'True';
    const framed = data.framed === 'True';
    const comments = data.comments || '';
    const image_path = data.image_path || '';
    const extra_images = data.extra_images || '[]';
    const progress_images = data.progress_images || '[]';

    console.log(`Updating Piece with id: ${piece_id}`);
    console.log(`Title: ${title}`);
    console.log(`Price: ${price}`);
    console.log(`Width: ${width}`);
    console.log(`Height: ${height}`);
    console.log(`Real Width: ${real_width}`);
    console.log(`Real Height: ${real_height}`);
    console.log(`Description: ${description}`);
    console.log(`Piece Type: ${piece_type}`);
    console.log(`Sold: ${sold}`);
    console.log(`Available: ${available}`);
    console.log(`Framed: ${framed}`);
    console.log(`Comments: ${comments}`);
    console.log(`Theme: ${theme}`);
    console.log(`Instagram: ${instagram}`);

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

    const piece = await prisma.piece.findUnique({ where: { id: pieceId } });
    if (!piece) {
        console.error(`Piece with id ${pieceId} not found`);
        return;
    }

    if (imageType === 'main') {
        // Modify the current main image
        await prisma.piece.update({
            where: { id: pieceId },
            data: { image_path: imageUrl },
        });
    } else {
        // Add a new extra or progress image
        const images = JSON.parse(piece[imageType as keyof Piece] as string) || [];
        const width = parseInt(data.width?.toString() || '0');
        const height = parseInt(data.height?.toString() || '0');
        images.push({ image_path: imageUrl, width, height });

        await prisma.piece.update({
            where: { id: pieceId },
            data: { [imageType]: JSON.stringify(images) },
        });
    }

    revalidatePath(`/edit/${piece.o_id}`);
    return imageUrl;
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
    width: number;
    height: number;
}

export async function handleImageDeleteAction(pieceId: number, imagePath: string, imageType: string) {
    const piece = await prisma.piece.findUnique({ where: { id: pieceId } });
    if (!piece) {
        console.error(`Piece with id ${pieceId} not found`);
        return;
    }

    const images = JSON.parse(piece[imageType as keyof Piece] as string) as ImageData[];
    const updatedImages = images.filter((image) => image.image_path !== imagePath);

    await prisma.piece.update({
        where: { id: pieceId },
        data: { [imageType]: JSON.stringify(updatedImages) },
    });

    revalidatePath(`/edit/${piece.o_id}`);
}

export async function createPiece(newPieceData: NewPieceData) {
    const { title, imagePath, width, height } = newPieceData;

    // Find the maximum o_id value from existing pieces
    const maxOId = await prisma.piece.aggregate({
        _max: {
            o_id: true,
        },
    });

    const newOId = (maxOId._max.o_id || 0) + 1;
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

    const newPiece = await prisma.piece.create({ data: data });

    return newPiece;
}
