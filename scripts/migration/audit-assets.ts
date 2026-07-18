import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { readJsonLines, type SourceDocument } from './shared';

const snapshotDirectory = process.argv.find((argument) => argument.startsWith('--snapshot='))?.slice('--snapshot='.length);
if (!snapshotDirectory) throw new Error('Pass --snapshot=/absolute/path/to/snapshot.');

type AssetReference = {
    url: string;
    sourceTable: string;
    legacyId: number;
    scope: 'operational' | 'transaction_snapshot';
};

const [pieces, extra, progress, verified] = await Promise.all([
    readJsonLines(snapshotDirectory, 'legacyPieces'),
    readJsonLines(snapshotDirectory, 'legacyExtraImages'),
    readJsonLines(snapshotDirectory, 'legacyProgressImages'),
    readJsonLines(snapshotDirectory, 'legacyVerifiedTransactions'),
]);

function referencesFromRows(options: {
    rows: SourceDocument[];
    sourceTable: string;
    scope: AssetReference['scope'];
    fields: string[];
}): AssetReference[] {
    return options.rows.flatMap((row) =>
        options.fields.flatMap((field) => {
            const value = row[field];
            return typeof value === 'string' && value.length > 0
                ? [{ url: value, sourceTable: options.sourceTable, legacyId: row.legacyId, scope: options.scope }]
                : [];
        }),
    );
}

const references = [
    ...referencesFromRows({
        rows: pieces,
        sourceTable: 'Pieces',
        scope: 'operational',
        fields: ['imagePath', 'smallImagePath'],
    }),
    ...referencesFromRows({
        rows: extra,
        sourceTable: 'ExtraImages',
        scope: 'operational',
        fields: ['imagePath', 'smallImagePath'],
    }),
    ...referencesFromRows({
        rows: progress,
        sourceTable: 'ProgressImages',
        scope: 'operational',
        fields: ['imagePath', 'smallImagePath'],
    }),
    ...referencesFromRows({
        rows: verified,
        sourceTable: 'VerifiedTransactions',
        scope: 'transaction_snapshot',
        fields: ['imagePath'],
    }),
];

const referencesByUrl = new Map<string, AssetReference[]>();
for (const reference of references) {
    const existing = referencesByUrl.get(reference.url) ?? [];
    existing.push(reference);
    referencesByUrl.set(reference.url, existing);
}

const urls = [...referencesByUrl.keys()];
const results: Array<{ url: string; status: number; host: string }> = [];
let cursor = 0;

async function inspectNext(): Promise<void> {
    while (cursor < urls.length) {
        const url = urls[cursor++];
        let status = 0;
        let host = '<invalid>';
        try {
            host = new URL(url).host;
            const response = await fetch(url, {
                method: 'HEAD',
                redirect: 'follow',
                signal: AbortSignal.timeout(30_000),
            });
            status = response.status;
        } catch {
            status = 0;
        }
        results.push({ url, status, host });
    }
}

await Promise.all(Array.from({ length: 12 }, () => inspectNext()));

const statuses: Record<string, number> = {};
const hosts: Record<string, number> = {};
const failures: Array<{
    status: number;
    host: string;
    references: Array<Omit<AssetReference, 'url'>>;
}> = [];
let operationalFailures = 0;

for (const result of results) {
    statuses[String(result.status)] = (statuses[String(result.status)] ?? 0) + 1;
    hosts[result.host] = (hosts[result.host] ?? 0) + 1;
    if (result.status === 200) continue;
    const affectedReferences = referencesByUrl.get(result.url) ?? [];
    if (affectedReferences.some((reference) => reference.scope === 'operational')) operationalFailures += 1;
    failures.push({
        status: result.status,
        host: result.host,
        references: affectedReferences.map(({ url: _url, ...reference }) => reference),
    });
}

const operationalUrls = new Set(references.filter((reference) => reference.scope === 'operational').map(({ url }) => url));
const transactionOnlyUrls = new Set(
    references
        .filter((reference) => reference.scope === 'transaction_snapshot' && !operationalUrls.has(reference.url))
        .map(({ url }) => url),
);
const nonHttp = urls.filter((url) => !/^https?:\/\//.test(url)).length;
const report = {
    snapshotDirectory: path.resolve(snapshotDirectory),
    checkedAt: new Date().toISOString(),
    uniqueUrls: urls.length,
    operationalUniqueUrls: operationalUrls.size,
    transactionOnlyUniqueUrls: transactionOnlyUrls.size,
    statuses,
    hosts,
    nonHttp,
    operationalFailures,
    failures,
    verified: operationalFailures === 0 && nonHttp === 0,
};

const reportDirectory = path.join(process.cwd(), '_overhaul', 'reports');
await mkdir(reportDirectory, { recursive: true });
await writeFile(path.join(reportDirectory, 'phase3-asset-audit.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report));
if (!report.verified) process.exitCode = 1;
