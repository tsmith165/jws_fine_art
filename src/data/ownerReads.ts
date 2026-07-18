import 'server-only';
import { asc, desc, eq } from 'drizzle-orm';
import { api } from '../../convex/_generated/api';
import { db, piecesTable, verifiedTransactionsTable } from '@/db/db';
import type { Pieces, VerifiedTransactions } from '@/db/schema';
import { requireAdmin } from '@/utils/auth/requireAdmin';
import { getReadBackend } from './readBackend';
import { ownerArtworkToLegacy, ownerTransactionToLegacy } from './ownerMapper';
import { getAuthenticatedOwnerConvexClient } from './ownerConvex';

async function assertNextOwner(): Promise<void> {
    const result = await requireAdmin('read owner data');
    if (!result.isAdmin) throw new Error(result.error);
}

export async function readOwnerArtworks(order: 'gallery' | 'homepage' | 'archive'): Promise<Pieces[]> {
    await assertNextOwner();
    if (getReadBackend() === 'convex') {
        const client = await getAuthenticatedOwnerConvexClient('read owner artwork');
        const artworks = (await client.query(api.ownerReads.listArtworks, {})).map(ownerArtworkToLegacy);
        if (order === 'archive') return artworks.filter((artwork) => !artwork.active).sort((a, b) => a.o_id - b.o_id || a.id - b.id);
        const active = artworks.filter((artwork) => artwork.active);
        return order === 'homepage'
            ? active.sort((a, b) => b.p_id - a.p_id || b.id - a.id)
            : active.sort((a, b) => a.o_id - b.o_id || a.id - b.id);
    }

    if (order === 'archive') {
        return db.select().from(piecesTable).where(eq(piecesTable.active, false)).orderBy(asc(piecesTable.o_id), asc(piecesTable.id));
    }
    return order === 'homepage'
        ? db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(desc(piecesTable.p_id), desc(piecesTable.id))
        : db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(asc(piecesTable.o_id), asc(piecesTable.id));
}

export async function readOwnerLegacyTransactions(): Promise<VerifiedTransactions[]> {
    await assertNextOwner();
    if (getReadBackend() === 'convex') {
        const client = await getAuthenticatedOwnerConvexClient('read owner orders');
        return (await client.query(api.ownerReads.listLegacyVerifiedTransactions, {})).map(ownerTransactionToLegacy);
    }
    return db.select().from(verifiedTransactionsTable).orderBy(asc(verifiedTransactionsTable.id));
}
