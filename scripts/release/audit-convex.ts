import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { convexArgs, parseConvexTarget } from './convex-target';

const target = parseConvexTarget();
const result = spawnSync(
    process.execPath,
    ['node_modules/convex/bin/main.js', ...convexArgs(['run', 'release:audit'], target)],
    {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: process.env,
    },
);
if (result.status !== 0) throw new Error(`Unable to run Convex release audit: ${result.stderr || result.stdout}`);

const audit = JSON.parse(result.stdout) as {
    openCheckoutIntents: number;
    openWebhookQuarantines: number;
    migrationConflicts: number;
    campaignsSending: number;
    failedCampaignRecipients: number;
    failedStripeWebhookInbox: number;
    failedNotificationOutbox: number;
    failedResendWebhookEvents: number;
    openReconciliationFindings: number;
};
const failures = [
    audit.openCheckoutIntents > 0 ? `${audit.openCheckoutIntents} checkout intent(s) are still open.` : null,
    audit.openWebhookQuarantines > 0 ? `${audit.openWebhookQuarantines} Stripe webhook quarantine item(s) are unresolved.` : null,
    audit.migrationConflicts > 0 ? `${audit.migrationConflicts} migration conflict(s) are unresolved.` : null,
    audit.campaignsSending > 0 ? `${audit.campaignsSending} campaign(s) are still sending.` : null,
    audit.failedCampaignRecipients > 0 ? `${audit.failedCampaignRecipients} campaign recipient delivery failure(s) need review.` : null,
    audit.failedStripeWebhookInbox > 0 ? `${audit.failedStripeWebhookInbox} Stripe event(s) exhausted durable retries.` : null,
    audit.failedNotificationOutbox > 0 ? `${audit.failedNotificationOutbox} confirmation email(s) exhausted durable retries.` : null,
    audit.failedResendWebhookEvents > 0 ? `${audit.failedResendWebhookEvents} Resend webhook event(s) failed processing.` : null,
    audit.openReconciliationFindings > 0 ? `${audit.openReconciliationFindings} commerce reconciliation finding(s) remain open.` : null,
].filter((failure): failure is string => Boolean(failure));

console.log(JSON.stringify({ target: target.label, ...audit, ready: failures.length === 0, failures }));
if (failures.length > 0) process.exitCode = 1;
