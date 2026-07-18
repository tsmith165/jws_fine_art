'use server';
import { PiecesWithImages } from '@/db/schema';
import {
    readAdjacentArtworkIds,
    readFirstAvailableArtworkId,
    readMostRecentArtworkId,
    readPublicArtwork,
    readPublicArtworkImage,
    readPublicArtworks,
    readPublicArtworksByIds,
} from '@/data/artworkReads';

export async function fetchPieces(): Promise<PiecesWithImages[]> {
    return readPublicArtworks();
}

export async function fetchPieceIds(): Promise<number[]> {
    return (await readPublicArtworks()).map((piece) => piece.id);
}

export async function fetchPieceById(id: number): Promise<PiecesWithImages> {
    const artwork = await readPublicArtwork(id);
    if (!artwork) throw new Error(`Artwork ${id} was not found.`);
    return artwork;
}

export async function fetchPiecesByIds(ids: number[]) {
    return readPublicArtworksByIds(ids);
}

export async function fetchAdjacentPieceIds(currentId: number) {
    return readAdjacentArtworkIds(currentId);
}

export async function fetchFirstPieceId(): Promise<number | null> {
    return readFirstAvailableArtworkId();
}

export async function getMostRecentId(): Promise<number | null> {
    return readMostRecentArtworkId();
}

export async function fetchPieceImageById(id: number) {
    return readPublicArtworkImage(id);
}
