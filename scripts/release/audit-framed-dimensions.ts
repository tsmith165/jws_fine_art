import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { convexArgs, parseConvexTarget } from './convex-target';

const target = parseConvexTarget();
const result = spawnSync(
    process.execPath,
    ['node_modules/convex/bin/main.js', ...convexArgs(['run', 'release:framedDimensionAudit'], target)],
    { cwd: process.cwd(), encoding: 'utf8', env: process.env },
);
if (result.status !== 0) throw new Error(`Unable to audit framed dimensions: ${result.stderr || result.stdout}`);

const audit = JSON.parse(result.stdout) as {
    total: number;
    availableMissing: number;
    byStatus: Record<string, { total: number; missing: number; estimated: number; verified: number }>;
    shippingChanges: unknown[];
    rows: unknown[];
};
const ready = audit.availableMissing === 0;
console.log(JSON.stringify({ target: target.label, ready, ...audit }, null, 2));
if (!ready) process.exitCode = 1;
