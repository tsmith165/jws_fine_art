import React from 'react';
import Image from 'next/image';
import { PiecesWithImages } from '@/db/schema';

interface GalleryPieceProps {
    piece: PiecesWithImages & { index: number };
    handlePieceClick: (id: number, index: number) => void;
}

const GalleryPiece = ({ piece, handlePieceClick }: GalleryPieceProps) => {
    const image_path = piece.small_image_path || piece.image_path;
    let image_width = 0;
    let image_height = 0;
    if (image_path === piece.small_image_path) {
        image_width = piece.small_width || 0;
        image_height = piece.small_height || 0;
    }
    if (image_path === piece.image_path || image_width === 0 || image_height === 0) {
        image_width = piece.width || 0;
        image_height = piece.height || 0;
    }

    return (
        <div
            key={`piece-${piece.id}`}
            className="group relative cursor-pointer overflow-hidden rounded-md bg-stone-600 shadow-md transition duration-300 ease-in-out hover:shadow-lg"
            onClick={() => handlePieceClick(piece.id, piece.index)}
        >
            <Image
                src={image_path}
                alt={piece.title}
                width={image_width}
                height={image_height}
                className="h-auto w-full rounded-md bg-stone-600 object-cover p-1"
                priority={piece.index < 10}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 p-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="text-center text-xl font-bold text-white">{piece.title}</p>
            </div>
            {(!piece.available || piece.sold) && <div className="absolute bottom-6 right-6 h-2 w-2 rounded-full bg-red-600 shadow-md" />}
        </div>
    );
};

export default GalleryPiece;
