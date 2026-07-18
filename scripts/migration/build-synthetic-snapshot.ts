import path from 'node:path';
import process from 'node:process';
import {
    canonicalJson,
    ensurePrivateDirectory,
    legacyTables,
    readJsonLines,
    readManifest,
    SERIALIZER_VERSION,
    sha256,
    sourceHash,
    summarizeFields,
    type LegacyTableName,
    type SnapshotManifest,
    type SourceDocument,
    writePrivateJson,
    writePrivateJsonLines,
} from './shared';

const sourceDirectory = process.argv.find((argument) => argument.startsWith('--source='))?.slice('--source='.length);
const outputDirectory = process.argv.find((argument) => argument.startsWith('--output='))?.slice('--output='.length);
if (!sourceDirectory || !outputDirectory) {
    throw new Error('Pass --source=/absolute/source/snapshot and --output=/absolute/synthetic/snapshot.');
}

await ensurePrivateDirectory(outputDirectory);
const sourceManifest = await readManifest(sourceDirectory);
const tables = {} as Record<LegacyTableName, SourceDocument[]>;
for (const table of legacyTables) tables[table] = await readJsonLines(sourceDirectory, table);

const removedPieceId = Math.max(...tables.legacyPieces.map((row) => row.legacyId));
const changedPieceId = Math.min(...tables.legacyPieces.map((row) => row.legacyId));
tables.legacyPieces = tables.legacyPieces.filter((row) => row.legacyId !== removedPieceId);
tables.legacyExtraImages = tables.legacyExtraImages.filter((row) => row.pieceLegacyId !== removedPieceId);
tables.legacyProgressImages = tables.legacyProgressImages.filter((row) => row.pieceLegacyId !== removedPieceId);

const changedPiece = tables.legacyPieces.find((row) => row.legacyId === changedPieceId);
if (!changedPiece) throw new Error('Unable to find the synthetic changed piece.');
changedPiece.title = `${changedPiece.title} [synthetic delta]`;

const addedPieceId = 1_000_001;
tables.legacyPieces.push({
    legacyId: addedPieceId,
    oId: -1_000_000,
    pId: -1_000_000,
    className: 'synthetic-migration-test',
    title: 'Synthetic Migration Test',
    imagePath: String(changedPiece.imagePath),
    width: Number(changedPiece.width),
    height: Number(changedPiece.height),
    smallImagePath: changedPiece.smallImagePath ?? null,
    smallWidth: changedPiece.smallWidth ?? null,
    smallHeight: changedPiece.smallHeight ?? null,
    price: 100,
    sold: false,
    available: true,
    description: null,
    pieceType: 'Migration Test',
    instagram: null,
    realWidth: 1,
    realHeight: 1,
    active: false,
    theme: 'Synthetic',
    framed: false,
    comments: 'Synthetic row; must never appear in an operational query.',
    snapshotId: '',
    sourceHash: '',
});

const sourcePayloads = {} as Record<LegacyTableName, Array<Record<string, unknown>>>;
for (const table of legacyTables) {
    sourcePayloads[table] = tables[table]
        .map(({ snapshotId: _snapshotId, sourceHash: _sourceHash, ...source }) => source)
        .sort((left, right) => Number(left.legacyId) - Number(right.legacyId));
}

const sourceSummaryHash = sha256(
    canonicalJson(legacyTables.map((table) => ({ table, rows: sourcePayloads[table].map((row) => sourceHash(row)) }))),
);
const createdAt = new Date().toISOString();
const snapshotId = `synthetic-${createdAt.replace(/[:.]/g, '-')}-${sourceSummaryHash.slice(0, 12)}`;
const manifest: SnapshotManifest = {
    snapshotId,
    createdAt,
    serializerVersion: SERIALIZER_VERSION,
    sourceSummaryHash,
    tables: {} as SnapshotManifest['tables'],
};

for (const table of legacyTables) {
    const documents = sourcePayloads[table].map((source) => ({
        ...source,
        snapshotId,
        sourceHash: sourceHash(source),
    })) as SourceDocument[];
    const file = `${table}.jsonl`;
    await writePrivateJsonLines(path.join(outputDirectory, file), documents);
    manifest.tables[table] = {
        file,
        count: documents.length,
        tableHash: sha256(canonicalJson(documents.map((document) => document.sourceHash))),
        legacyIds: documents.map((document) => document.legacyId),
        ...summarizeFields(sourcePayloads[table]),
    };
}

await writePrivateJson(path.join(outputDirectory, 'manifest.json'), manifest);
await writePrivateJson(path.join(outputDirectory, 'synthetic-expectations.json'), {
    sourceSnapshotId: sourceManifest.snapshotId,
    snapshotId,
    changedPieceId,
    removedPieceId,
    addedPieceId,
});

console.log(
    JSON.stringify({
        outputDirectory,
        snapshotId,
        sourceSummaryHash,
        changedPieceId,
        removedPieceId,
        addedPieceId,
    }),
);
