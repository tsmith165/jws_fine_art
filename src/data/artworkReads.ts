import 'server-only';
import { asc, desc, eq, inArray } from 'drizzle-orm';
import { api } from '../../convex/_generated/api';
import { db, extraImagesTable, piecesTable, progressImagesTable } from '@/db/db';
import type { PiecesWithImages } from '@/db/schema';
import { getConvexClient } from './convexClient';
import { getReadBackend } from './readBackend';
import { toLegacyArtwork } from './artworkMapper';

async function neonPieces(): Promise<PiecesWithImages[]> {
    const rows = await db
        .select({ piece: piecesTable, extraImage: extraImagesTable, progressImage: progressImagesTable })
        .from(piecesTable)
        .where(eq(piecesTable.active, true))
        .leftJoin(extraImagesTable, eq(extraImagesTable.piece_id, piecesTable.id))
        .leftJoin(progressImagesTable, eq(progressImagesTable.piece_id, piecesTable.id))
        .orderBy(desc(piecesTable.o_id), desc(piecesTable.id));

    const pieces = new Map<number, PiecesWithImages>();
    for (const row of rows) {
        const piece = pieces.get(row.piece.id) ?? { ...row.piece, extraImages: [], progressImages: [] };
        if (row.extraImage && !piece.extraImages.some((image) => image.id === row.extraImage?.id)) {
            piece.extraImages.push(row.extraImage);
        }
        if (row.progressImage && !piece.progressImages.some((image) => image.id === row.progressImage?.id)) {
            piece.progressImages.push(row.progressImage);
        }
        pieces.set(piece.id, piece);
    }
    return [...pieces.values()];
}

export async function readPublicArtworks(): Promise<PiecesWithImages[]> {
    if (getReadBackend() === 'neon') return neonPieces();
    const artworks = await getConvexClient().query(api.artworks.listPublic, {});
    return artworks.map(toLegacyArtwork).sort((a, b) => b.o_id - a.o_id || b.id - a.id);
}

export async function readPublicArtwork(id: number): Promise<PiecesWithImages | null> {
    if (getReadBackend() === 'convex') {
        const artwork = await getConvexClient().query(api.artworks.getPublicByLegacyId, { legacyId: id });
        return artwork ? toLegacyArtwork(artwork) : null;
    }
    const [piece] = await db.select().from(piecesTable).where(eq(piecesTable.id, id)).limit(1);
    if (!piece) return null;
    const [extraImages, progressImages] = await Promise.all([
        db.select().from(extraImagesTable).where(eq(extraImagesTable.piece_id, id)).orderBy(asc(extraImagesTable.id)),
        db.select().from(progressImagesTable).where(eq(progressImagesTable.piece_id, id)).orderBy(asc(progressImagesTable.id)),
    ]);
    return { ...piece, extraImages, progressImages };
}

export async function readPublicArtworkBySlug(slug: string): Promise<PiecesWithImages | null> {
    if (getReadBackend() === 'convex') {
        const artwork = await getConvexClient().query(api.artworks.getPublicBySlug, { slug });
        return artwork ? toLegacyArtwork(artwork) : null;
    }
    const trailingId = Number(slug.match(/-(\d+)$/)?.[1] ?? slug);
    return Number.isSafeInteger(trailingId) ? readPublicArtwork(trailingId) : null;
}

export async function readPublicArtworksByIds(ids: number[]): Promise<PiecesWithImages[]> {
    if (ids.length === 0) return [];
    if (getReadBackend() === 'convex') {
        const requested = new Set(ids);
        return (await readPublicArtworks()).filter((artwork) => requested.has(artwork.id));
    }
    const pieces = await db.select().from(piecesTable).where(inArray(piecesTable.id, ids));
    return Promise.all(pieces.map((piece) => readPublicArtwork(piece.id))).then((items) => items.filter((item) => item !== null));
}

export async function readHomepageArtworks(limit: number): Promise<PiecesWithImages[]> {
    if (getReadBackend() === 'convex') {
        const artworks = await getConvexClient().query(api.artworks.listHomepage, { limit });
        return artworks.map(toLegacyArtwork);
    }
    const rows = await db
        .select()
        .from(piecesTable)
        .where(eq(piecesTable.active, true))
        .orderBy(desc(piecesTable.p_id), desc(piecesTable.id))
        .limit(limit);
    return rows.map((piece) => ({ ...piece, extraImages: [], progressImages: [] }));
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

export async function readMostRecentArtworkId(): Promise<number | null> {
    return (await readPublicArtworks())[0]?.id ?? null;
}

export async function readPublicArtworkImage(id: number) {
    const artwork = await readPublicArtwork(id);
    return artwork ? { image_path: artwork.image_path, width: artwork.width, height: artwork.height } : null;
}
