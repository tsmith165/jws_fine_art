import { eq, desc } from 'drizzle-orm';
import { db, piecesTable, verifiedTransactionsTable, pendingTransactionsTable } from '@/db/db';
import { Pieces, VerifiedTransactions, PendingTransactions } from '@/db/schema';

export async function fetchPieces(): Promise<Pieces[]> {
    console.log(`Fetching pieces with Drizzle`);
    const pieceList = await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(desc(piecesTable.o_id));
    return pieceList;
}

export async function getMostRecentId(): Promise<number | null> {
    console.log('Fetching most recent piece ID...');
    const piece = await db.select().from(piecesTable).where(eq(piecesTable.active, true)).orderBy(desc(piecesTable.o_id)).limit(1);

    return piece[0]?.id || null;
}

export async function fetchVerifiedPayments(): Promise<VerifiedTransactions[]> {
    console.log(`Fetching verified payments with Drizzle`);
    const verifiedList = await db.select().from(verifiedTransactionsTable);

    console.log('Verified Payments List (Next Line):');
    console.log(verifiedList);

    const formattedList = verifiedList.map((payment) => ({
        ...payment,
        date: new Date(payment.date).toUTCString(),
    }));

    console.log('Formatted Verified Payments List (Next Line):');
    console.log(formattedList);

    return formattedList;
}
