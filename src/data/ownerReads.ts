import 'server-only';
import { cache } from 'react';
import { api } from '../../convex/_generated/api';
import type { Pieces, VerifiedTransactions } from '@/types/artwork';
import { requireAdmin } from '@/utils/auth/requireAdmin';
import { ownerArtworkToLegacy, ownerArtworkWithMediaToLegacy, ownerTransactionToLegacy } from './ownerMapper';
import { getAuthenticatedOwnerConvexClient } from './ownerConvex';

async function assertNextOwner(): Promise<void> {
    const result = await requireAdmin('read owner data');
    if (!result.isAdmin) throw new Error(result.error);
}

export async function readOwnerArtworks(order: 'gallery' | 'homepage' | 'archive'): Promise<Pieces[]> {
    await assertNextOwner();
    const client = await getAuthenticatedOwnerConvexClient('read owner artwork');
    const artworks = (await client.query(api.ownerReads.listArtworks, {})).map(ownerArtworkToLegacy);
    if (order === 'archive') return artworks.filter((artwork) => !artwork.active).sort((a, b) => a.o_id - b.o_id || a.id - b.id);
    const active = artworks.filter((artwork) => artwork.active);
    return order === 'homepage'
        ? active.sort((a, b) => b.p_id - a.p_id || b.id - a.id)
        : active.sort((a, b) => a.o_id - b.o_id || a.id - b.id);
}

export async function readOwnerLegacyTransactions(): Promise<VerifiedTransactions[]> {
    await assertNextOwner();
    const client = await getAuthenticatedOwnerConvexClient('read owner orders');
    return (await client.query(api.ownerReads.listLegacyVerifiedTransactions, {})).map(ownerTransactionToLegacy);
}

export const readOwnerArtworksWithMedia = cache(async function readOwnerArtworksWithMedia() {
    await assertNextOwner();
    const client = await getAuthenticatedOwnerConvexClient('read owner artwork media');
    return (await client.query(api.ownerReads.listArtworks, {})).map(ownerArtworkWithMediaToLegacy);
});

export async function readOwnerHomepageRotation(): Promise<{ configured: boolean; artworkLegacyIds: number[] }> {
    await assertNextOwner();
    const client = await getAuthenticatedOwnerConvexClient('read homepage rotation');
    return client.query(api.ownerReads.getHomepageRotation, {});
}
