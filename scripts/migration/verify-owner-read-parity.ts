import { spawnSync } from 'node:child_process';
import '../../src/lib/config';
import { asc } from 'drizzle-orm';
import type { api } from '../../convex/_generated/api';
import type { FunctionReturnType } from 'convex/server';
import { db, extraImagesTable, piecesTable, progressImagesTable, verifiedTransactionsTable } from '../../src/db/db';
import { ownerArtworkWithMediaToLegacy, ownerTransactionToLegacy } from '../../src/data/ownerMapper';
import { canonicalJson } from './shared';

type AuditContracts = {
    artworks: FunctionReturnType<typeof api.ownerReads.listArtworks>;
    legacyVerifiedTransactions: FunctionReturnType<typeof api.ownerReads.listLegacyVerifiedTransactions>;
};

const command = spawnSync('corepack', ['pnpm', 'exec', 'convex', 'run', 'ownerReads:auditReadContracts', '{}'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
});
if (command.status !== 0) throw new Error(`Unable to read the internal owner audit: ${command.stderr || command.stdout}`);
const convex = JSON.parse(command.stdout) as AuditContracts;
const [pieces, extraImages, progressImages, transactions] = await Promise.all([
    db.select().from(piecesTable).orderBy(asc(piecesTable.id)),
    db.select().from(extraImagesTable).orderBy(asc(extraImagesTable.id)),
    db.select().from(progressImagesTable).orderBy(asc(progressImagesTable.id)),
    db.select().from(verifiedTransactionsTable).orderBy(asc(verifiedTransactionsTable.id)),
]);
const neonArtworks = pieces.map((piece) => ({
    ...piece,
    extraImages: extraImages.filter((image) => image.piece_id === piece.id),
    progressImages: progressImages.filter((image) => image.piece_id === piece.id),
}));
const convexArtworks = convex.artworks.map(ownerArtworkWithMediaToLegacy).sort((a, b) => a.id - b.id);
const convexTransactions = convex.legacyVerifiedTransactions.map(ownerTransactionToLegacy).sort((a, b) => a.id - b.id);

if (canonicalJson(convexArtworks) !== canonicalJson(neonArtworks)) throw new Error('Convex and Neon owner artwork contracts diverged.');
if (canonicalJson(convexTransactions) !== canonicalJson(transactions))
    throw new Error('Convex and Neon legacy transaction contracts diverged.');

console.log(
    JSON.stringify({
        verified: true,
        ownerArtworkCount: convexArtworks.length,
        supportingImageCount: extraImages.length,
        progressImageCount: progressImages.length,
        legacyTransactionCount: convexTransactions.length,
        siteContent: 'static source constants; no Neon-backed read contract exists',
    }),
);
