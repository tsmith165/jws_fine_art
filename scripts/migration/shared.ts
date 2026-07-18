import { createHash } from 'node:crypto';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const SERIALIZER_VERSION = 'jws-neon-canonical-json-v1';

export const legacyTables = [
    'legacyPieces',
    'legacyExtraImages',
    'legacyProgressImages',
    'legacyPendingTransactions',
    'legacyVerifiedTransactions',
] as const;

export type LegacyTableName = (typeof legacyTables)[number];

export type SourceDocument = {
    legacyId: number;
    snapshotId: string;
    sourceHash: string;
    [key: string]: boolean | number | string | null;
};

export type SnapshotManifest = {
    snapshotId: string;
    createdAt: string;
    serializerVersion: typeof SERIALIZER_VERSION;
    sourceSummaryHash: string;
    tables: Record<
        LegacyTableName,
        {
            file: string;
            count: number;
            tableHash: string;
            legacyIds: number[];
            nullCounts: Record<string, number>;
            emptyStringCounts: Record<string, number>;
        }
    >;
};

export function canonicalize(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (value !== null && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>)
                .sort(([left], [right]) => left.localeCompare(right))
                .map(([key, child]) => [key, canonicalize(child)]),
        );
    }
    return value;
}

export function canonicalJson(value: unknown): string {
    return JSON.stringify(canonicalize(value));
}

export function sha256(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}

export function sourceHash(source: Record<string, unknown>): string {
    return sha256(canonicalJson(source));
}

export async function ensurePrivateDirectory(directory: string): Promise<void> {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await chmod(directory, 0o700);
}

export async function writePrivateJsonLines(filePath: string, rows: SourceDocument[]): Promise<void> {
    await writeFile(filePath, `${rows.map((row) => canonicalJson(row)).join('\n')}\n`, {
        encoding: 'utf8',
        mode: 0o600,
    });
    await chmod(filePath, 0o600);
}

export async function writePrivateJson(filePath: string, value: unknown): Promise<void> {
    await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await chmod(filePath, 0o600);
}

export async function readManifest(snapshotDirectory: string): Promise<SnapshotManifest> {
    return JSON.parse(await readFile(path.join(snapshotDirectory, 'manifest.json'), 'utf8')) as SnapshotManifest;
}

export async function readJsonLines(snapshotDirectory: string, table: LegacyTableName): Promise<SourceDocument[]> {
    const manifest = await readManifest(snapshotDirectory);
    const contents = await readFile(path.join(snapshotDirectory, manifest.tables[table].file), 'utf8');
    return contents
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line) as SourceDocument);
}

export function summarizeFields(rows: Array<Record<string, unknown>>): {
    nullCounts: Record<string, number>;
    emptyStringCounts: Record<string, number>;
} {
    const fields = new Set(rows.flatMap((row) => Object.keys(row)));
    const nullCounts: Record<string, number> = {};
    const emptyStringCounts: Record<string, number> = {};
    for (const field of [...fields].sort()) {
        nullCounts[field] = rows.filter((row) => row[field] === null).length;
        emptyStringCounts[field] = rows.filter((row) => row[field] === '').length;
    }
    return { nullCounts, emptyStringCounts };
}
