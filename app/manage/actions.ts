import { prisma } from '@/lib/prisma';

export async function getPieces() {
    'use server';
    return await prisma.piece.findMany({
        where: { active: true, o_id: { gte: 0 } },
        orderBy: { o_id: 'asc' },
    });
}

export async function getDeletedPieces() {
    'use server';
    return await prisma.piece.findMany({
        where: { active: false },
        orderBy: { o_id: 'asc' },
    });
}

export async function changeOrder(currIdList: number[], nextIdList: number[]) {
    'use server';
    const [currId, currOrderId] = currIdList;
    const [nextId, nextOrderId] = nextIdList;
    console.log(`Swapping ${currId} (${currOrderId}) with ${nextId} (${nextOrderId})`);
    await prisma.piece.update({
        where: { id: currId },
        data: { o_id: nextOrderId },
    });

    await prisma.piece.update({
        where: { id: nextId },
        data: { o_id: currOrderId },
    });
}

export async function setInactive(id: number) {
    'use server';
    console.log(`Setting piece with id: ${id} as inactive`);
    await prisma.piece.update({
        where: { id },
        data: { active: false, o_id: -1000000 },
    });
}

export async function setActive(id: number) {
    'use server';
    console.log(`Setting piece with id: ${id} as active`);

    // Find the maximum o_id value from active pieces
    const maxOId = await prisma.piece.aggregate({
        where: { active: true, o_id: { gte: 0 } },
        _max: { o_id: true },
    });

    const newOId = (maxOId._max.o_id || 0) + 1;

    await prisma.piece.update({
        where: { id },
        data: { active: true, o_id: newOId },
    });
}

export async function editDetails(details: PieceDetails) {
    'use server';
    const {
        id,
        title,
        description,
        pieceType,
        sold,
        price,
        instagram,
        width,
        height,
        realWidth,
        realHeight,
        theme,
        available,
        framed,
        comments,
        imagePath,
        extraImages,
        progressImages,
    } = details;

    console.log(`Editing piece with id: ${id}`);
    await prisma.piece.update({
        where: { id },
        data: {
            title: title,
            width: parseInt(width),
            height: parseInt(height),
            description: description,
            piece_type: pieceType,
            sold: sold === 'Sold',
            price: parseInt(price),
            real_width: parseInt(realWidth),
            real_height: parseInt(realHeight),
            instagram: instagram.split('/').pop(),
            theme: theme.replace('None, ', ''),
            available: available === 'True',
            framed: framed === 'True',
            comments: comments,
            image_path: imagePath,
            extra_images: extraImages.join(','),
            progress_images: progressImages.join(','),
        },
    });
}

export async function createPiece(details: NewPieceDetails) {
    const {
        title,
        description,
        pieceType,
        sold,
        price,
        instagram,
        width,
        height,
        realWidth,
        realHeight,
        imagePath,
        theme,
        available,
        framed,
        comments,
    } = details;

    // Find the maximum o_id value from existing pieces
    const maxOId = await prisma.piece.aggregate({
        _max: {
            o_id: true,
        },
    });

    const newOId = (maxOId._max.o_id || 0) + 1;

    await prisma.piece.create({
        data: {
            title,
            image_path: imagePath,
            width: parseInt(width),
            height: parseInt(height),
            description: description,
            piece_type: pieceType,
            sold: sold === 'Sold',
            price: parseInt(price),
            real_width: parseInt(realWidth),
            real_height: parseInt(realHeight),
            active: true,
            instagram: instagram.split('/').pop(),
            theme: theme.replace('None, ', ''),
            available: available === 'True',
            framed: framed === 'True',
            comments: comments,
            o_id: newOId,
            class_name: '',
        },
    });
}

interface PieceDetails {
    id: number;
    title: string;
    description: string;
    pieceType: string;
    sold: string;
    price: string;
    instagram: string;
    width: string;
    height: string;
    realWidth: string;
    realHeight: string;
    theme: string;
    available: string;
    framed: string;
    comments: string;
    imagePath: string;
    extraImages: string[];
    progressImages: string[];
}

interface NewPieceDetails {
    title: string;
    description: string;
    pieceType: string;
    sold: string;
    price: string;
    instagram: string;
    width: string;
    height: string;
    realWidth: string;
    realHeight: string;
    imagePath: string;
    theme: string;
    available: string;
    framed: string;
    comments: string;
}
