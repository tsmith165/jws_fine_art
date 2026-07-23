import 'server-only';
import { api } from '../../convex/_generated/api';
import { getConvexClient } from './convexClient';
import { toLegacyArtwork } from './artworkMapper';
import type { PiecesWithImages } from '@/types/artwork';

export async function readPublicArtworks(): Promise<PiecesWithImages[]> {
    const artworks = await getConvexClient().query(api.artworks.listPublic, {});
    return artworks.map(toLegacyArtwork).sort((a, b) => b.o_id - a.o_id || b.id - a.id);
}

export async function readPublicArtwork(id: number): Promise<PiecesWithImages | null> {
    const artwork = await getConvexClient().query(api.artworks.getPublicByLegacyId, { legacyId: id });
    return artwork ? toLegacyArtwork(artwork) : null;
}

export async function readPublicArtworkBySlug(slug: string): Promise<PiecesWithImages | null> {
    const artwork = await getConvexClient().query(api.artworks.getPublicBySlug, { slug });
    return artwork ? toLegacyArtwork(artwork) : null;
}

export async function readHomepageArtworks(): Promise<PiecesWithImages[]> {
    const artworks = await getConvexClient().query(api.artworks.listHomepage, {});
    return artworks.map(toLegacyArtwork);
}

export async function readFirstAvailableArtworkId(): Promise<number | null> {
    const artworks = await readPublicArtworks();
    return artworks.find((artwork) => !artwork.sold && artwork.available)?.id ?? null;
}

export async function readAdjacentArtworkIds(currentId: number): Promise<{ next_id: number; last_id: number }> {
    const artworks = (await readPublicArtworks()).sort((a, b) => a.o_id - b.o_id);
    const index = artworks.findIndex((artwork) => artwork.id === currentId);
    if (index === -1 || artworks.length === 0) return { next_id: -1, last_id: -1 };
    return {
        next_id: artworks[(index + 1) % artworks.length].id,
        last_id: artworks[(index - 1 + artworks.length) % artworks.length].id,
    };
}
