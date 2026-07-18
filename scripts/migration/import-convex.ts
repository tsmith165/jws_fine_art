import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { legacyTables, readManifest } from './shared';

const snapshotDirectory = process.argv.find((argument) => argument.startsWith('--snapshot='))?.slice('--snapshot='.length);
if (!snapshotDirectory) throw new Error('Pass --snapshot=/absolute/path/to/snapshot.');
if (process.argv.includes('--prod')) throw new Error('Production imports are intentionally disabled.');

const manifest = await readManifest(snapshotDirectory);

function runConvex(args: string[]): string {
    const result = spawnSync('corepack', ['pnpm', 'exec', 'convex', ...args], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env,
    });
    if (result.status !== 0) {
        throw new Error(`Convex command failed (${args[0]}): ${result.stderr || result.stdout}`);
    }
    return result.stdout.trim();
}

for (const table of legacyTables) {
    const tableFile = path.join(snapshotDirectory, manifest.tables[table].file);
    const existingCount = Number(
        JSON.parse(runConvex(['run', 'migrations:snapshotTableStatus', JSON.stringify({ table, snapshotId: manifest.snapshotId })])),
    );
    const expectedCount = manifest.tables[table].count;
    if (existingCount === expectedCount) continue;
    if (existingCount !== 0) {
        throw new Error(
            `${table} snapshot ${manifest.snapshotId} is partially imported (${existingCount}/${expectedCount}); refusing to append duplicates.`,
        );
    }
    runConvex(['import', '--table', table, '--append', '--yes', tableFile]);
}

const importedAt = Date.now();
const runId = `${manifest.snapshotId}-${importedAt}`;
const deriveResult = runConvex([
    'run',
    'migrations:deriveCanonical',
    JSON.stringify({
        runId,
        snapshotId: manifest.snapshotId,
        sourceSummaryHash: manifest.sourceSummaryHash,
        importedAt,
    }),
]);

console.log(
    JSON.stringify({
        runId,
        snapshotId: manifest.snapshotId,
        sourceSummaryHash: manifest.sourceSummaryHash,
        deriveResult: JSON.parse(deriveResult) as unknown,
    }),
);
