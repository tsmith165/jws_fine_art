import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { convexArgs, defaultBackupPath, parseConvexTarget, readArgument, requireDestructiveTargetConfirmation } from './convex-target';

const target = parseConvexTarget();
if (target.kind !== 'development') requireDestructiveTargetConfirmation(target);

const outputPath = path.resolve(readArgument('--output') || defaultBackupPath(target));
await mkdir(path.dirname(outputPath), { recursive: true });

const args = convexArgs(['export', '--path', outputPath, '--include-file-storage'], target);
const result = spawnSync('corepack', ['pnpm', 'exec', 'convex', ...args], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
});
if (result.status !== 0) throw new Error(`Convex export failed: ${result.stderr || result.stdout}`);

const archive = await readFile(outputPath);
const manifest = {
    createdAt: new Date().toISOString(),
    target: target.label,
    archive: outputPath,
    bytes: archive.byteLength,
    sha256: createHash('sha256').update(archive).digest('hex'),
};
const manifestPath = `${outputPath}.manifest.json`;
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
console.log(JSON.stringify({ ...manifest, manifest: manifestPath }));
