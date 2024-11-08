import { fetchPieces } from '@/app/actions';
import React from 'react';
import Slideshow from './Slideshow';

export default async function SlideshowPage() {
    const pieceList = await fetchPieces();
    return <Slideshow pieceList={pieceList} />;
}

export const revalidate = 60;
