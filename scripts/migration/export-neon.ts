import nextEnv from '@next/env';
import pg from 'pg';
import { chmod, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {
    canonicalJson,
    ensurePrivateDirectory,
    legacyTables,
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

const { loadEnvConfig } = nextEnv;
const { Client } = pg;

loadEnvConfig(process.cwd());

type Row = Record<string, boolean | number | string | null>;

const outputArgument = process.argv.find((argument) => argument.startsWith('--output='));
const today = new Date().toISOString().slice(0, 10);
const outputDirectory = outputArgument?.slice('--output='.length) ?? `/Users/tsmith/dev/_codex/jws-fine-art-migration/${today}`;
const reportDirectory = path.join(process.cwd(), '_overhaul', 'reports');
const databaseUrl = process.env.NEON_DATABASE_URL ?? process.env.DATABASE_URL;

if (!databaseUrl) throw new Error('NEON_DATABASE_URL or DATABASE_URL is required.');

const tableQueries: Record<LegacyTableName, string> = {
    legacyPieces: `
        SELECT
            id AS "legacyId", o_id AS "oId", p_id AS "pId", class_name AS "className",
            title, image_path AS "imagePath", width, height,
            small_image_path AS "smallImagePath", small_width AS "smallWidth", small_height AS "smallHeight",
            price, sold, available, description, piece_type AS "pieceType", instagram,
            real_width AS "realWidth", real_height AS "realHeight", active, theme, framed, comments
        FROM "Pieces"
        ORDER BY id
    `,
    legacyExtraImages: `
        SELECT
            id AS "legacyId", piece_id AS "pieceLegacyId", title, image_path AS "imagePath", width, height,
            small_image_path AS "smallImagePath", small_width AS "smallWidth", small_height AS "smallHeight"
        FROM "ExtraImages"
        ORDER BY id
    `,
    legacyProgressImages: `
        SELECT
            id AS "legacyId", piece_id AS "pieceLegacyId", title, image_path AS "imagePath", width, height,
            small_image_path AS "smallImagePath", small_width AS "smallWidth", small_height AS "smallHeight"
        FROM "ProgressImages"
        ORDER BY id
    `,
    legacyPendingTransactions: `
        SELECT
            id AS "legacyId", piece_db_id AS "pieceLegacyId", piece_title AS "pieceTitle",
            full_name AS "fullName", phone, email, address, international
        FROM "PendingTransactions"
        ORDER BY id
    `,
    legacyVerifiedTransactions: `
        SELECT
            id AS "legacyId", piece_db_id AS "pieceLegacyId", piece_title AS "pieceTitle",
            full_name AS "fullName", phone, email, address, international,
            image_path AS "imagePath", image_width AS "imageWidth", image_height AS "imageHeight",
            to_char(date, 'YYYY-MM-DD') AS "purchasedOn", stripe_id AS "stripeId", price
        FROM "VerifiedTransactions"
        ORDER BY id
    `,
};

function attachSourceMetadata(rows: Row[], snapshotId: string): SourceDocument[] {
    return rows.map((row) => ({
        ...row,
        snapshotId,
        sourceHash: sourceHash(row),
    })) as SourceDocument[];
}

const client = new Client({
    connectionString: databaseUrl,
    options: '-c default_transaction_read_only=on',
});

await ensurePrivateDirectory(outputDirectory);
await mkdir(reportDirectory, { recursive: true });
await client.connect();

try {
    await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');

    const exportedAt = new Date().toISOString();
    const rawRows = {} as Record<LegacyTableName, Row[]>;
    for (const table of legacyTables) {
        const result = await client.query<Row>(tableQueries[table]);
        rawRows[table] = result.rows;
    }

    const provisionalSummary = legacyTables.map((table) => ({
        table,
        rows: rawRows[table].map((row) => sourceHash(row)),
    }));
    const sourceSummaryHash = sha256(canonicalJson(provisionalSummary));
    const snapshotId = `${exportedAt.replace(/[:.]/g, '-')}-${sourceSummaryHash.slice(0, 12)}`;

    const manifest: SnapshotManifest = {
        snapshotId,
        createdAt: exportedAt,
        serializerVersion: SERIALIZER_VERSION,
        sourceSummaryHash,
        tables: {} as SnapshotManifest['tables'],
    };

    for (const table of legacyTables) {
        const documents = attachSourceMetadata(rawRows[table], snapshotId);
        const file = `${table}.jsonl`;
        const fieldSummary = summarizeFields(rawRows[table]);
        await writePrivateJsonLines(path.join(outputDirectory, file), documents);
        manifest.tables[table] = {
            file,
            count: documents.length,
            tableHash: sha256(canonicalJson(documents.map((document) => document.sourceHash))),
            legacyIds: documents.map((document) => document.legacyId),
            ...fieldSummary,
        };
    }

    await writePrivateJson(path.join(outputDirectory, 'manifest.json'), manifest);

    const pieceIds = new Set(rawRows.legacyPieces.map((row) => row.legacyId));
    const verifiedStripeIds = rawRows.legacyVerifiedTransactions.map((row) => row.stripeId);
    const piiSafeReport = {
        snapshotId,
        createdAt: exportedAt,
        serializerVersion: SERIALIZER_VERSION,
        sourceSummaryHash,
        tables: manifest.tables,
        reconciliation: {
            unresolvedPendingArtworkReferences: rawRows.legacyPendingTransactions.filter((row) => !pieceIds.has(row.pieceLegacyId)).length,
            unresolvedVerifiedArtworkReferences: rawRows.legacyVerifiedTransactions.filter((row) => !pieceIds.has(row.pieceLegacyId))
                .length,
            verifiedRows: verifiedStripeIds.length,
            distinctVerifiedStripeIds: new Set(verifiedStripeIds).size,
            soldAndAvailableArtworks: rawRows.legacyPieces.filter((row) => row.sold === true && row.available === true).length,
            nonPositivePriceArtworks: rawRows.legacyPieces.filter((row) => Number(row.price) <= 0).length,
        },
    };

    const reportPath = path.join(reportDirectory, 'phase3-source-summary.json');
    await writeFile(reportPath, `${JSON.stringify(piiSafeReport, null, 2)}\n`, 'utf8');
    await chmod(reportPath, 0o644);
    await client.query('ROLLBACK');

    console.log(
        JSON.stringify({
            snapshotDirectory: outputDirectory,
            reportPath,
            snapshotId,
            sourceSummaryHash,
            counts: Object.fromEntries(legacyTables.map((table) => [table, manifest.tables[table].count])),
        }),
    );
} catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
} finally {
    await client.end();
}
