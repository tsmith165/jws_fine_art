import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { legacyArtworkSlug } from '../../convex/lib/legacy';
import { legacyTables, readJsonLines, readManifest, type LegacyTableName, type SourceDocument } from './shared';
import { convexArgs, parseConvexTarget } from '../release/convex-target';

const snapshotDirectory = process.argv.find((argument) => argument.startsWith('--snapshot='))?.slice('--snapshot='.length);
if (!snapshotDirectory) throw new Error('Pass --snapshot=/absolute/path/to/snapshot.');

const manifest = await readManifest(snapshotDirectory);
const target = parseConvexTarget();
const source = {} as Record<LegacyTableName, SourceDocument[]>;
for (const table of legacyTables) source[table] = await readJsonLines(snapshotDirectory, table);

const auditCommand = spawnSync(
    'corepack',
    [
        'pnpm',
        'exec',
        'convex',
        ...convexArgs(['run', 'migrations:auditSummary', JSON.stringify({ snapshotId: manifest.snapshotId })], target),
    ],
    {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env,
    },
);
if (auditCommand.status !== 0) {
    throw new Error(`Unable to read the internal migration audit: ${auditCommand.stderr || auditCommand.stdout}`);
}
const audit = JSON.parse(auditCommand.stdout) as {
    raw: Record<LegacyTableName, Array<Record<string, unknown> & { legacyId: number; sourceHash: string }>>;
    canonical: {
        artworks: Array<Record<string, unknown> & { legacyId: number; sourceHash: string; slug: string; absentFromSource: boolean }>;
        artworkMedia: Array<
            Record<string, unknown> & {
                legacyTable: 'Pieces' | 'ExtraImages' | 'ProgressImages';
                legacyId: number;
                artworkLegacyId: number;
                sourceHash: string;
                absentFromSource: boolean;
            }
        >;
        legacyOrders: Array<{ legacySourceIds: number[]; legacyStripeId: string | null }>;
    };
    migrationRuns: Array<{ runId: string; snapshotId: string; status: string; conflicts: number }>;
    conflictCount: number;
};
const failures: string[] = [];
if (audit.conflictCount > 0) {
    failures.push(`migration conflicts: ${audit.conflictCount} unresolved conflict(s) must be dispositioned before cutover.`);
}

function compareRaw(table: LegacyTableName): void {
    const expected = new Map(source[table].map((row) => [row.legacyId, row.sourceHash]));
    const actualRows = audit.raw[table] as Array<{ legacyId: number; sourceHash: string }>;
    const actual = new Map(actualRows.map((row) => [row.legacyId, row.sourceHash]));
    if (actual.size !== expected.size) failures.push(`${table}: expected ${expected.size} rows, received ${actual.size}.`);
    for (const [legacyId, hash] of expected) {
        if (actual.get(legacyId) !== hash) failures.push(`${table}: source hash mismatch for legacy ID ${legacyId}.`);
    }
    for (const legacyId of actual.keys()) {
        if (!expected.has(legacyId)) failures.push(`${table}: unexpected legacy ID ${legacyId}.`);
    }
}

for (const table of legacyTables) compareRaw(table);

const pieceIds = new Set(source.legacyPieces.map((row) => row.legacyId));
const expectedMediaCount = source.legacyPieces.length + source.legacyExtraImages.length + source.legacyProgressImages.length;
const expectedOrderCount = new Set(source.legacyVerifiedTransactions.map((row) => row.stripeId)).size;

const operationalArtworks = audit.canonical.artworks.filter((artwork) => !artwork.absentFromSource);
const operationalMedia = audit.canonical.artworkMedia.filter((media) => !media.absentFromSource);

if (operationalArtworks.length !== source.legacyPieces.length) {
    failures.push(`operational artworks: expected ${source.legacyPieces.length}, received ${operationalArtworks.length}.`);
}
if (operationalMedia.length !== expectedMediaCount) {
    failures.push(`operational artworkMedia: expected ${expectedMediaCount}, received ${operationalMedia.length}.`);
}
if (audit.canonical.legacyOrders.length !== expectedOrderCount) {
    failures.push(`legacy orders: expected ${expectedOrderCount}, received ${audit.canonical.legacyOrders.length}.`);
}

for (const artwork of audit.canonical.artworks) {
    const sourcePiece = source.legacyPieces.find((piece) => piece.legacyId === artwork.legacyId);
    if (!sourcePiece) {
        if (!artwork.absentFromSource) {
            failures.push(`artworks: canonical legacy ID ${artwork.legacyId} has no source piece and is still operational.`);
        }
        continue;
    }
    if (artwork.sourceHash !== sourcePiece.sourceHash) failures.push(`artworks: hash mismatch for ${artwork.legacyId}.`);
    const firstImportSlug = legacyArtworkSlug(String(sourcePiece.title), sourcePiece.legacyId);
    if (!artwork.slug.endsWith(`-${artwork.legacyId}`) || artwork.slug.length <= String(artwork.legacyId).length + 1) {
        failures.push(`artworks: invalid immutable slug for ${artwork.legacyId}.`);
    }
    if (!manifest.snapshotId.startsWith('synthetic-') && artwork.slug !== firstImportSlug) {
        failures.push(`artworks: source-baseline slug mismatch for ${artwork.legacyId}.`);
    }
    if (artwork.absentFromSource) failures.push(`artworks: source piece ${artwork.legacyId} is incorrectly absent.`);

    const expectedFields = {
        title: sourcePiece.title,
        description: sourcePiece.description,
        medium: sourcePiece.pieceType,
        theme: sourcePiece.theme,
        instagramUrl: sourcePiece.instagram,
        ownerNotes: sourcePiece.comments,
        className: sourcePiece.className,
        priceCents: Number(sourcePiece.price) * 100,
        sold: sourcePiece.sold ?? false,
        available: sourcePiece.available ?? true,
        active: sourcePiece.active ?? true,
        framed: sourcePiece.framed ?? false,
        widthInches: sourcePiece.realWidth,
        heightInches: sourcePiece.realHeight,
    };
    for (const [field, expected] of Object.entries(expectedFields)) {
        if (!Object.is(artwork[field], expected)) {
            failures.push(`artworks: ${field} mismatch for ${artwork.legacyId}.`);
        }
    }
}

for (const media of audit.canonical.artworkMedia) {
    if (!pieceIds.has(media.artworkLegacyId) && !media.absentFromSource) {
        failures.push(`${media.legacyTable}:${media.legacyId} references missing artwork ${media.artworkLegacyId}.`);
    }
    const sourceTable =
        media.legacyTable === 'Pieces'
            ? source.legacyPieces
            : media.legacyTable === 'ExtraImages'
              ? source.legacyExtraImages
              : source.legacyProgressImages;
    const sourceMedia = sourceTable.find((row) => row.legacyId === media.legacyId);
    if (sourceMedia && media.absentFromSource) {
        failures.push(`${media.legacyTable}:${media.legacyId} is incorrectly absent.`);
    }
    if (!sourceMedia && !media.absentFromSource) {
        failures.push(`${media.legacyTable}:${media.legacyId} is missing from the source but remains operational.`);
    }
    if (sourceMedia) {
        const expectedRole = media.legacyTable === 'Pieces' ? 'primary' : media.legacyTable === 'ExtraImages' ? 'supporting' : 'progress';
        const expectedMediaFields = {
            artworkLegacyId: media.legacyTable === 'Pieces' ? sourceMedia.legacyId : sourceMedia.pieceLegacyId,
            sourceHash: sourceMedia.sourceHash,
            role: expectedRole,
            title: media.legacyTable === 'Pieces' ? null : sourceMedia.title,
            sourceUrl: sourceMedia.imagePath,
            sourceWidth: sourceMedia.width,
            sourceHeight: sourceMedia.height,
            smallUrl: sourceMedia.smallImagePath,
            smallWidth: sourceMedia.smallWidth,
            smallHeight: sourceMedia.smallHeight,
        };
        for (const [field, expected] of Object.entries(expectedMediaFields)) {
            if (!Object.is(media[field], expected)) {
                failures.push(`${media.legacyTable}:${media.legacyId} ${field} mismatch.`);
            }
        }
    }
}

const expectedPendingOrphans = source.legacyPendingTransactions.filter(
    (transaction) => !pieceIds.has(Number(transaction.pieceLegacyId)),
).length;
const actualPendingOrphans = audit.raw.legacyPendingTransactions.filter(
    (transaction) => !pieceIds.has(Number(transaction.pieceLegacyId)),
).length;
if (actualPendingOrphans !== expectedPendingOrphans) {
    failures.push(`pending orphan references: expected ${expectedPendingOrphans}, received ${actualPendingOrphans}.`);
}

const result = {
    snapshotId: manifest.snapshotId,
    sourceSummaryHash: manifest.sourceSummaryHash,
    counts: {
        raw: Object.fromEntries(legacyTables.map((table) => [table, source[table].length])),
        artworks: operationalArtworks.length,
        artworkMedia: operationalMedia.length,
        retainedAbsentArtworks: audit.canonical.artworks.length - operationalArtworks.length,
        retainedAbsentMedia: audit.canonical.artworkMedia.length - operationalMedia.length,
        legacyOrders: audit.canonical.legacyOrders.length,
        pendingOrphans: actualPendingOrphans,
        migrationConflicts: audit.conflictCount,
    },
    verified: failures.length === 0,
    failures,
    snapshotDirectory: path.resolve(snapshotDirectory),
};

console.log(JSON.stringify(result));
if (failures.length > 0) process.exitCode = 1;
