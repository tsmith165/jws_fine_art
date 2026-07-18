import 'server-only';
import { auth } from '@clerk/nextjs/server';
import { asc, desc, eq } from 'drizzle-orm';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../convex/_generated/api';
import { db, piecesTable, verifiedTransactionsTable } from '@/db/db';
import type { Pieces, VerifiedTransactions } from '@/db/schema';
import { requireAdmin } from '@/utils/auth/requireAdmin';
import { getReadBackend } from './readBackend';
import { ownerArtworkToLegacy, ownerTransactionToLegacy } from './ownerMapper';

async function assertNextOwner(): Promise<void> {
    const result = await requireAdmin('read owner data');
    if (!result.isAdmin) throw new Error(result.error);
}

async function authenticatedConvexClient(): Promise<ConvexHttpClient> {
    const deploymentUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!deploymentUrl) throw new Error('NEXT_PUBLIC_CONVEX_URL is required when JWS_READ_BACKEND=convex.');
    const { getToken } = await auth();
    const token = await getToken({ template: 'convex' });
    if (!token) throw new Error('Unable to create the Clerk token required for Convex owner reads.');
    const client = new ConvexHttpClient(deploymentUrl);
    client.setAuth(token);
    return client;
}

export async function readOwnerArtworks(order: 'gallery' | 'homepage' | 'archive'): Promise<Pieces[]> {
    await assertNextOwner();
    if (getReadBackend() === 'convex') {
        const client = await authenticatedConvexClient();
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
        const client = await authenticatedConvexClient();
        return (await client.query(api.ownerReads.listLegacyVerifiedTransactions, {})).map(ownerTransactionToLegacy);
    }
    return db.select().from(verifiedTransactionsTable).orderBy(asc(verifiedTransactionsTable.id));
}
