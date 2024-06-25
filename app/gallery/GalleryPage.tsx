import { Pieces } from '@/db/schema';
import { fetchPieces } from '@/app/actions';
import React from 'react';
import Gallery from './Gallery';

async function fetchPiecesData(): Promise<Pieces[]> {
    const pieces = fetchPieces();
    return pieces;
}

export default async function GalleryPage() {
    const piecesData = await fetchPiecesData();

    return <Gallery pieces={piecesData} />;
}

export const revalidate = 60;
