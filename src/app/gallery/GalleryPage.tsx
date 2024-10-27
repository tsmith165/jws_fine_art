import { fetchPieces } from '@/app/actions';
import React from 'react';
import Gallery from './Gallery';
import { ParsedParams } from './parsers';

interface GalleryPageProps {
    parsedParams: ParsedParams;
}

export default async function GalleryPage({ parsedParams }: GalleryPageProps) {
    console.log(`Loading Gallery Page`);
    const piecesData = await fetchPieces();

    return <Gallery initialPieces={piecesData} initialPieceId={parsedParams.piece} />;
}

export const revalidate = 60;
