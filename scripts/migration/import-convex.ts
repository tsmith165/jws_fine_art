import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { legacyTables, readManifest } from './shared';
import {
    convexArgs,
    defaultBackupPath,
    parseConvexTarget,
    readArgument,
    requireDestructiveTargetConfirmation,
} from '../release/convex-target';

const snapshotDirectory = process.argv.find((argument) => argument.startsWith('--snapshot='))?.slice('--snapshot='.length);
if (!snapshotDirectory) throw new Error('Pass --snapshot=/absolute/path/to/snapshot.');
const target = parseConvexTarget();
requireDestructiveTargetConfirmation(target);

const manifest = await readManifest(snapshotDirectory);

function runConvex(args: string[]): string {
    const result = spawnSync('corepack', ['pnpm', 'exec', 'convex', ...convexArgs(args, target)], {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env,
    });
    if (result.status !== 0) {
        throw new Error(`Convex command failed (${args[0]}): ${result.stderr || result.stdout}`);
    }
    return result.stdout.trim();
}

if (target.kind !== 'development') {
    const backupPath = path.resolve(readArgument('--backup') || defaultBackupPath(target));
    await mkdir(path.dirname(backupPath), { recursive: true });
    runConvex(['export', '--path', backupPath, '--include-file-storage']);
    const archive = await readFile(backupPath);
    const backupManifestPath = `${backupPath}.manifest.json`;
    await writeFile(
        backupManifestPath,
        `${JSON.stringify(
            {
                createdAt: new Date().toISOString(),
                purpose: 'pre-import rollback snapshot',
                target: target.label,
                archive: backupPath,
                bytes: archive.byteLength,
                sha256: createHash('sha256').update(archive).digest('hex'),
            },
            null,
            2,
        )}\n`,
        { mode: 0o600 },
    );
    console.error(`Pre-import backup created at ${backupPath}; manifest ${backupManifestPath}`);

    const deployment = JSON.parse(runConvex(['run', 'release:audit'])) as {
        rawCounts: Record<string, number>;
        canonicalCounts: Record<string, number>;
    };
    const rawCounts = Object.values(deployment.rawCounts);
    const canonicalCounts = Object.values(deployment.canonicalCounts);
    if (rawCounts.every((count) => count === 0) && canonicalCounts.some((count) => count > 0)) {
        throw new Error('The target has operational data but no matching migration snapshot. Import into a clean deployment instead.');
    }
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
