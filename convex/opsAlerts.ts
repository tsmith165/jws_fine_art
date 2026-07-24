import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction } from './_generated/server';

const STUDIO_ALERT_RECIPIENT = 'jwsfineart@gmail.com';
const RETRY_DELAYS_MS = [60_000, 300_000, 1_800_000];

// Fail-loud channel for operational problems the Business dashboard would
// otherwise surface silently. Alerts are advisory: delivery is retried a few
// times with a stable idempotency key, but the dashboard remains the durable
// record, so a permanently failed alert only logs.
export const sendOperationsAlert = internalAction({
    args: {
        kind: v.union(v.literal('quarantine_opened'), v.literal('webhook_failed'), v.literal('dispute_opened'), v.literal('email_failed')),
        sourceId: v.string(),
        summary: v.string(),
        detail: v.string(),
        attempt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const attempt = args.attempt ?? 0;
        try {
            const apiKey = process.env.RESEND_API_KEY;
            if (!apiKey) throw new Error('RESEND_API_KEY is not configured for operations alerts.');
            const text = [
                args.detail,
                '',
                'Review and resolve this in the Business dashboard:',
                'https://www.jwsfineart.com/admin/business',
            ].join('\n');
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': `ops-alert-${args.kind}-${args.sourceId}`,
                },
                body: JSON.stringify({
                    from: 'JWS Fine Art <contact@jwsfineart.com>',
                    to: STUDIO_ALERT_RECIPIENT,
                    subject: `Studio alert: ${args.summary}`,
                    text,
                    tags: [{ name: 'ops_alert', value: args.kind }],
                }),
            });
            const body = (await response.json().catch(() => null)) as { message?: string } | null;
            if (!response.ok) throw new Error(body?.message || `Resend returned HTTP ${response.status}.`);
        } catch (error) {
            const delay = RETRY_DELAYS_MS[attempt];
            if (delay !== undefined) {
                await ctx.scheduler.runAfter(delay, internal.opsAlerts.sendOperationsAlert, { ...args, attempt: attempt + 1 });
            } else {
                console.error(`Operations alert ${args.kind}/${args.sourceId} was not delivered:`, error);
            }
        }
    },
});
