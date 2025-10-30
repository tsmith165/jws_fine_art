import React, { Suspense } from 'react';
import { fetchPieces } from '@/app/actions';
import Gallery from './Gallery';

interface GallerySectionProps {
    initialPieceId?: string;
}

async function GalleryData({ initialPieceId }: GallerySectionProps) {
    const pieces = await fetchPieces();
    return <Gallery initialPieces={pieces} initialPieceId={initialPieceId || ''} />;
}

export default async function GallerySection({ initialPieceId }: GallerySectionProps) {
    return (
        <div id="gallery" className="w-full">
            <Suspense fallback={null}>
                <GalleryData initialPieceId={initialPieceId} />
            </Suspense>
        </div>
    );
}
