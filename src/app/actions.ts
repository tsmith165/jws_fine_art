'use server';
import { PiecesWithImages } from '@/types/artwork';
import { readPublicArtworks } from '@/data/artworkReads';

export async function fetchPieces(): Promise<PiecesWithImages[]> {
    return readPublicArtworks();
}
