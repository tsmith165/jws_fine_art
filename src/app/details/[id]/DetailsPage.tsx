import { fetchPieceById, fetchAdjacentPieceIds } from '@/app/actions';
import { PiecesWithImages } from '@/db/schema';
import React from 'react';
import Details from './Details';

interface DetailsPageProps {
    id: number;
    selectedIndex: number;
    type: string;
}

async function fetchPieceData(id: number): Promise<PiecesWithImages> {
    const piece = await fetchPieceById(id);
    const { next_id, last_id } = await fetchAdjacentPieceIds(id);

    return {
        ...piece,
        next_id,
        last_id,
    };
}

export default async function DetailsPage({ id, selectedIndex, type }: DetailsPageProps) {
    const pieceData = await fetchPieceData(id);

    return <Details pieceData={pieceData} selectedIndex={selectedIndex} type={type} />;
}

export const revalidate = 60;
