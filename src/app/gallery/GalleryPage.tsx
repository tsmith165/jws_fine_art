import { fetchPieces } from '@/app/actions';
import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import Gallery from './Gallery';

export default async function GalleryPage({ searchParams }: { searchParams: { piece?: string } }) {
    console.log(`Loading Gallery Page`);
    const piecesData = await fetchPieces();

    return <Gallery initialPieces={piecesData} />;
}

export const revalidate = 60;
