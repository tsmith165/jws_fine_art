import type { Metadata } from 'next';
export const metadata: Metadata = {
    title: 'JWS Fine Art - Homepage',
    description: 'Jill Weeks Smith Biography',
    icons: {
        icon: '/JWS_ICON.png',
    },
    openGraph: {
        title: 'JWS Fine Art - Homepage',
    },
};

import { db, piecesTable } from '@/db/db';
import { eq, asc } from 'drizzle-orm';
import { Pieces } from '@/db/schema';

import PageLayout from '@/components/layout/PageLayout';
import Homepage from '@/app/Homepage';

export default async function Page() {
    const { most_recent_id } = await getPieceList();

    return (
        <PageLayout page="/">
            <Homepage most_recent_id={most_recent_id} />
        </PageLayout>
    );
}

async function fetchFirstPiece(): Promise<Pieces | null> {
    console.log(`Fetching pieces with Drizzle`);
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(asc(piecesTable.o_id)).limit(1);

    return piece[0] || null;
}

async function getPieceList() {
    console.log('Fetching piece list...');
    const firstPiece = await fetchFirstPiece();

    return {
        most_recent_id: firstPiece ? firstPiece.id : null,
    };
}
