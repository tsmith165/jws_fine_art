import nextEnv from '@next/env';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import Stripe from 'stripe';
import { assertStripeEnvironment } from '../../src/lib/providerSafety';
import { convexArgs, parseConvexTarget, requireDestructiveTargetConfirmation } from './convex-target';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const target = parseConvexTarget();
if (target.kind !== 'development') requireDestructiveTargetConfirmation(target);
const providerEnvironment = {
    ...process.env,
    VERCEL_ENV: target.kind === 'production' ? 'production' : process.env.VERCEL_ENV || 'development',
};
let stripeSecretKey: string;
try {
    stripeSecretKey = assertStripeEnvironment(providerEnvironment).secretKey;
} catch (error) {
    console.log(
        JSON.stringify({
            target: target.label,
            ready: false,
            failures: [error instanceof Error ? error.message : 'Stripe environment validation failed.'],
        }),
    );
    process.exit(1);
}
const stripe = new Stripe(stripeSecretKey, { apiVersion: '2026-06-24.dahlia' });

const convexResult = spawnSync('corepack', ['pnpm', 'exec', 'convex', ...convexArgs(['run', 'release:audit'], target)], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
});
if (convexResult.status !== 0) throw new Error(`Unable to run Convex release audit: ${convexResult.stderr || convexResult.stdout}`);
const convexAudit = JSON.parse(convexResult.stdout) as { openCheckoutIntents: number; openWebhookQuarantines: number };

const [openSessions, recentEvents] = await Promise.all([
    stripe.checkout.sessions.list({ status: 'open', limit: 100 }),
    stripe.events.list({ created: { gte: Math.floor(Date.now() / 1000) - 24 * 60 * 60 }, limit: 100 }),
]);
const pendingWebhookEvents = recentEvents.data.filter((event) => event.pending_webhooks > 0).length;
const failures = [
    openSessions.data.length > 0 ? `${openSessions.data.length} Stripe Checkout session(s) remain open.` : null,
    openSessions.has_more ? 'More than 100 Stripe Checkout sessions remain open.' : null,
    pendingWebhookEvents > 0 ? `${pendingWebhookEvents} recent Stripe event(s) still have pending webhook deliveries.` : null,
    convexAudit.openCheckoutIntents > 0 ? `${convexAudit.openCheckoutIntents} Convex checkout intent(s) remain open.` : null,
    convexAudit.openWebhookQuarantines > 0 ? `${convexAudit.openWebhookQuarantines} Convex Stripe quarantine item(s) remain open.` : null,
].filter((failure): failure is string => Boolean(failure));

console.log(
    JSON.stringify({
        target: target.label,
        stripeOpenSessions: openSessions.data.length,
        stripeOpenSessionsTruncated: openSessions.has_more,
        pendingWebhookEvents,
        convexOpenCheckoutIntents: convexAudit.openCheckoutIntents,
        convexOpenWebhookQuarantines: convexAudit.openWebhookQuarantines,
        ready: failures.length === 0,
        failures,
    }),
);
if (failures.length > 0) process.exitCode = 1;
