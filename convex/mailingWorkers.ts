import { v } from 'convex/values';
import { internal } from './_generated/api';
import { internalAction, internalMutation, internalQuery } from './_generated/server';

const MAX_ATTEMPTS = 6;
const LEASE_MS = 5 * 60_000;
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000, 8 * 60 * 60_000];

function safeError(error: unknown) {
    return error instanceof Error ? error.message.slice(0, 1000) : 'Unknown campaign delivery error.';
}

function base64Url(bytes: Uint8Array) {
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

async function unsubscribeUrls(email: string) {
    const secret = process.env.UNSUBSCRIBE_SIGNING_SECRET || process.env.CONVEX_SERVER_WRITE_SECRET;
    const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://www.jwsfineart.com';
    if (!secret || secret.length < 32) throw new Error('Mailing unsubscribe configuration is incomplete.');
    const normalized = email.trim().toLowerCase();
    const payload = base64Url(new TextEncoder().encode(normalized));
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const signature = base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))));
    const base = origin.startsWith('http') ? origin : `https://${origin}`;
    const token = encodeURIComponent(`${payload}.${signature}`);
    return {
        page: `${base}/unsubscribe?token=${token}`,
        oneClick: `${base}/api/unsubscribe?token=${token}`,
    };
}

function htmlWithFooter(html: string, pageUrl: string) {
    return `${html}<div style="margin-top:32px;padding-top:20px;border-top:1px solid #d8d8d2;color:#686d67;font:12px/1.5 Arial,sans-serif;text-align:center">You received this studio note because you joined the JWS Fine Art mailing list. <a href="${pageUrl}" style="color:#315e52">Unsubscribe</a>.</div>`;
}

function textWithFooter(text: string, pageUrl: string) {
    return `${text.trim()}\n\n---\nYou received this studio note because you joined the JWS Fine Art mailing list.\nUnsubscribe: ${pageUrl}`;
}

export const getRecipient = internalQuery({
    args: { recipientId: v.id('campaignRecipients') },
    handler: async (ctx, args) => {
        const recipient = await ctx.db.get(args.recipientId);
        if (!recipient) return null;
        const [campaign, subscriber] = await Promise.all([ctx.db.get(recipient.campaignId), ctx.db.get(recipient.subscriberId)]);
        if (!campaign || !subscriber) return null;
        return { recipient, campaign, subscriber };
    },
});

export const beginRecipientAttempt = internalMutation({
    args: { recipientId: v.id('campaignRecipients') },
    handler: async (ctx, args) => {
        const recipient = await ctx.db.get(args.recipientId);
        if (!recipient || ['sent', 'delivered', 'delayed', 'bounced', 'complained', 'suppressed', 'skipped'].includes(recipient.status)) {
            return false;
        }
        if (recipient.status === 'sending' && recipient.updatedAt > Date.now() - LEASE_MS) return false;
        const attempts = (recipient.attempts ?? 0) + 1;
        await ctx.db.patch(recipient._id, {
            status: 'sending',
            attempts,
            lastError: null,
            nextAttemptAt: null,
            updatedAt: Date.now(),
        });
        return true;
    },
});

export const finishRecipientAttempt = internalMutation({
    args: {
        recipientId: v.id('campaignRecipients'),
        outcome: v.union(v.literal('sent'), v.literal('failed'), v.literal('suppressed')),
        providerMessageId: v.union(v.string(), v.null()),
        error: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        const recipient = await ctx.db.get(args.recipientId);
        if (!recipient || ['sent', 'delivered', 'bounced', 'complained', 'suppressed', 'skipped'].includes(recipient.status)) return;
        const now = Date.now();
        if (args.outcome === 'sent') {
            await ctx.db.patch(recipient._id, {
                status: 'sent',
                providerMessageId: args.providerMessageId,
                lastError: null,
                nextAttemptAt: null,
                sentAt: now,
                updatedAt: now,
            });
        } else if (args.outcome === 'suppressed') {
            await ctx.db.patch(recipient._id, {
                status: 'suppressed',
                lastError: args.error,
                nextAttemptAt: null,
                updatedAt: now,
            });
        } else {
            const attempts = recipient.attempts ?? 1;
            const retry = attempts < MAX_ATTEMPTS;
            const delay = RETRY_DELAYS_MS[Math.min(Math.max(attempts - 1, 0), RETRY_DELAYS_MS.length - 1)] ?? 0;
            await ctx.db.patch(recipient._id, {
                status: retry ? 'queued' : 'failed',
                lastError: args.error,
                nextAttemptAt: retry ? now + delay : null,
                updatedAt: now,
            });
            if (retry) {
                await ctx.scheduler.runAfter(delay, internal.mailingWorkers.sendCampaignRecipient, { recipientId: recipient._id });
            }
        }
        await ctx.scheduler.runAfter(0, internal.mailingWorkers.finalizeCampaign, { campaignId: recipient.campaignId });
    },
});

export const finalizeCampaign = internalMutation({
    args: { campaignId: v.id('campaigns') },
    handler: async (ctx, args) => {
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign || campaign.status !== 'sending') return;
        const recipients = await ctx.db
            .query('campaignRecipients')
            .withIndex('by_campaign_id', (q) => q.eq('campaignId', campaign._id))
            .collect();
        if (recipients.some((item) => item.status === 'queued' || item.status === 'sending')) return;
        const failed = recipients.filter((item) => item.status === 'failed').length;
        const accepted = recipients.filter((item) => ['sent', 'delivered', 'delayed'].includes(item.status)).length;
        const now = Date.now();
        await ctx.db.patch(campaign._id, {
            status: failed > 0 || accepted === 0 ? 'failed' : 'sent',
            sentAt: accepted > 0 ? (campaign.sentAt ?? now) : campaign.sentAt,
            updatedAt: now,
        });
    },
});

export const sendCampaignRecipient = internalAction({
    args: { recipientId: v.id('campaignRecipients') },
    handler: async (ctx, args) => {
        const claimed = await ctx.runMutation(internal.mailingWorkers.beginRecipientAttempt, args);
        if (!claimed) return;
        await ctx.scheduler.runAfter(LEASE_MS + 60_000, internal.mailingWorkers.sendCampaignRecipient, args);
        const record = await ctx.runQuery(internal.mailingWorkers.getRecipient, args);
        if (!record) return;
        if (record.subscriber.status !== 'subscribed') {
            await ctx.runMutation(internal.mailingWorkers.finishRecipientAttempt, {
                recipientId: args.recipientId,
                outcome: 'suppressed',
                providerMessageId: null,
                error: `Recipient is ${record.subscriber.status}.`,
            });
            return;
        }
        try {
            const apiKey = process.env.RESEND_API_KEY;
            if (!apiKey) throw new Error('RESEND_API_KEY is not configured for campaign delivery.');
            const urls = await unsubscribeUrls(record.subscriber.email);
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': `campaign-${record.campaign._id}-${record.recipient._id}`,
                },
                body: JSON.stringify({
                    from: 'JWS Fine Art <contact@jwsfineart.com>',
                    to: record.subscriber.email,
                    subject: record.campaign.subject,
                    html: htmlWithFooter(record.campaign.renderedHtml, urls.page),
                    text: textWithFooter(record.campaign.renderedText || record.campaign.subject, urls.page),
                    headers: {
                        'List-Unsubscribe': `<${urls.oneClick}>, <${urls.page}>`,
                        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
                    },
                    tags: [
                        { name: 'campaign_id', value: String(record.campaign._id) },
                        { name: 'recipient_id', value: String(record.recipient._id) },
                    ],
                }),
            });
            const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
            if (!response.ok) throw new Error(body?.message || `Resend returned HTTP ${response.status}.`);
            await ctx.runMutation(internal.mailingWorkers.finishRecipientAttempt, {
                recipientId: args.recipientId,
                outcome: 'sent',
                providerMessageId: body?.id ?? null,
                error: null,
            });
        } catch (error) {
            await ctx.runMutation(internal.mailingWorkers.finishRecipientAttempt, {
                recipientId: args.recipientId,
                outcome: 'failed',
                providerMessageId: null,
                error: safeError(error),
            });
        }
    },
});
