import { Pieces } from '@/db/schema';
import { fetchPieces } from '@/app/actions';
import React, { Suspense } from 'react';
import Gallery from './Gallery';

async function fetchPiecesData(): Promise<Pieces[]> {
    const pieces = fetchPieces();
    return pieces;
}

export default async function GalleryPage() {
    const piecesData = await fetchPiecesData();

    return (
        <Suspense fallback={''}>
            <Gallery pieces={piecesData} />
        </Suspense>
    );
}

export const revalidate = 60;
