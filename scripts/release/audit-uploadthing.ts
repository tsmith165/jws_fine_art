import nextEnv from '@next/env';
import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { UTApi } from 'uploadthing/server';
import { convexArgs, parseConvexTarget } from './convex-target';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

if (!process.env.UPLOADTHING_TOKEN) {
    console.log(
        JSON.stringify({
            target: 'not-checked',
            ready: false,
            failures: ['UPLOADTHING_TOKEN is not configured.'],
        }),
    );
    process.exit(1);
}

function providerKey(value: string): string | null {
    try {
        const url = new URL(value);
        if (!['utfs.io', 'ufs.sh'].some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))) return null;
        const match = url.pathname.match(/\/f\/([^/?#]+)/);
        return match?.[1] ?? null;
    } catch {
        return null;
    }
}

const target = parseConvexTarget();
const inventoryResult = spawnSync('corepack', ['pnpm', 'exec', 'convex', ...convexArgs(['run', 'release:mediaInventory'], target)], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
});
if (inventoryResult.status !== 0)
    throw new Error(`Unable to read Convex media inventory: ${inventoryResult.stderr || inventoryResult.stdout}`);

const referencedUrls = JSON.parse(inventoryResult.stdout) as string[];
const referencedKeys = new Set(referencedUrls.map(providerKey).filter((key): key is string => Boolean(key)));
const api = new UTApi({ token: process.env.UPLOADTHING_TOKEN });
const providerFiles: Array<{ key: string; status: string; size: number; uploadedAt: number }> = [];
let offset = 0;
while (true) {
    const page = await api.listFiles({ limit: 500, offset });
    providerFiles.push(...page.files.map(({ key, status, size, uploadedAt }) => ({ key, status, size, uploadedAt })));
    if (!page.hasMore || page.files.length === 0) break;
    offset += page.files.length;
}

const providerKeys = new Set(providerFiles.map((file) => file.key));
const orphaned = providerFiles.filter((file) => file.status === 'Uploaded' && !referencedKeys.has(file.key));
const missing = [...referencedKeys].filter((key) => !providerKeys.has(key));
const report = {
    createdAt: new Date().toISOString(),
    target: target.label,
    referencedProviderObjects: referencedKeys.size,
    providerObjects: providerFiles.length,
    orphanedProviderObjects: orphaned,
    missingProviderKeys: missing,
    ready: missing.length === 0,
};
const reportRoot = process.env.JWS_RELEASE_REPORT_ROOT || path.resolve(process.cwd(), '..', 'jws-fine-art-release-reports');
await mkdir(reportRoot, { recursive: true });
const reportPath = path.join(reportRoot, `uploadthing-${target.label.replaceAll(':', '-')}-${Date.now()}.json`);
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
console.log(
    JSON.stringify({
        target: target.label,
        referencedProviderObjects: report.referencedProviderObjects,
        providerObjects: report.providerObjects,
        orphanedProviderObjects: orphaned.length,
        missingProviderObjects: missing.length,
        ready: report.ready,
        report: reportPath,
    }),
);
if (!report.ready) process.exitCode = 1;
