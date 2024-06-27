import { fetchPieceById, fetchAdjacentPieceIds, fetchPieces } from '@/app/actions';
import { PiecesWithImages } from '@/db/schema';
import React from 'react';
import Slideshow from './Slideshow';

async function fetchPieceData(id: number): Promise<PiecesWithImages> {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);

    return {
        ...piece,
        next_id,
        last_id,
    };
}

export default async function SlideshowPage() {
    const pieceList = await fetchPieces();

    return <Slideshow pieceList={pieceList} />;
}

export const revalidate = 60;
