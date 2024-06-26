import '@/lib/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { piecesTable, pendingTransactionsTable, verifiedTransactionsTable, extraImagesTable, progressImagesTable } from './schema';

const sql = neon(process.env.NEON_DATABASE_URL!);
const db = drizzle(sql);

export { db, piecesTable, pendingTransactionsTable, verifiedTransactionsTable, extraImagesTable, progressImagesTable };
