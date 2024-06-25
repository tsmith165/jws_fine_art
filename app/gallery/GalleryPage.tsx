import { fetchPieces } from '@/app/actions';
import React from 'react';
import Gallery from './Gallery';

export default async function GalleryPage() {
    const piecesData = await fetchPieces();

    return <Gallery pieces={piecesData} />;
}

export const revalidate = 60;
