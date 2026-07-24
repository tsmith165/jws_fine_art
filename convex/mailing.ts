import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation } from './_generated/server';
import { requireServerSecret } from './lib/serverSecret';

const nullableString = v.union(v.string(), v.null());
const nullableNumber = v.union(v.number(), v.null());

type RecipientStatus =
    'queued' | 'sending' | 'sent' | 'delivered' | 'delayed' | 'bounced' | 'complained' | 'suppressed' | 'skipped' | 'failed';

function recipientStatus(eventType: string): RecipientStatus | null {
    if (eventType === 'email.sent') return 'sent';
    if (eventType === 'email.delivered') return 'delivered';
    if (eventType === 'email.delivery_delayed') return 'delayed';
    if (eventType === 'email.bounced') return 'bounced';
    if (eventType === 'email.complained') return 'complained';
    if (eventType === 'email.suppressed') return 'suppressed';
    if (eventType === 'email.failed') return 'failed';
    return null;
}

function adverse(eventType: string) {
    return ['email.bounced', 'email.complained', 'email.suppressed', 'email.failed'].includes(eventType);
}

export const processResendWebhook = mutation({
    args: {
        serverSecret: v.string(),
        svixId: v.string(),
        eventType: v.string(),
        providerMessageId: nullableString,
        campaignRecipientId: v.optional(nullableString),
        notificationOutboxId: v.optional(nullableString),
        eventAt: nullableNumber,
        summaryJson: v.string(),
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const existing = await ctx.db
            .query('resendWebhookEvents')
            .withIndex('by_svix_id', (q) => q.eq('svixId', args.svixId))
            .unique();
        if (existing) return { outcome: 'duplicate' as const };
        const now = Date.now();
        const status = recipientStatus(args.eventType);
        let outcome: 'processed' | 'ignored' = 'ignored';

        if (args.providerMessageId && status) {
            const taggedRecipientId = args.campaignRecipientId ? ctx.db.normalizeId('campaignRecipients', args.campaignRecipientId) : null;
            const recipient =
                (taggedRecipientId ? await ctx.db.get(taggedRecipientId) : null) ??
                (await ctx.db
                    .query('campaignRecipients')
                    .withIndex('by_provider_message_id', (q) => q.eq('providerMessageId', args.providerMessageId))
                    .unique());
            if (recipient) {
                const isNewer = !recipient.lastProviderEventAt || !args.eventAt || args.eventAt >= recipient.lastProviderEventAt;
                const isTerminal = ['bounced', 'complained', 'suppressed'].includes(recipient.status);
                if (isNewer && (!isTerminal || adverse(args.eventType))) {
                    await ctx.db.patch(recipient._id, {
                        status,
                        lastError: adverse(args.eventType) ? args.summaryJson.slice(0, 1000) : null,
                        lastProviderEventAt: args.eventAt ?? now,
                        updatedAt: now,
                    });
                    if (['bounced', 'complained', 'suppressed'].includes(status)) {
                        const subscriber = await ctx.db.get(recipient.subscriberId);
                        if (subscriber && subscriber.status === 'subscribed') {
                            await ctx.db.patch(subscriber._id, {
                                status: 'suppressed',
                                suppressionReason: `${args.eventType}: ${args.summaryJson.slice(0, 500)}`,
                                lastProviderEventAt: args.eventAt ?? now,
                                updatedAt: now,
                            });
                            await ctx.db.insert('subscriptionEvents', {
                                subscriberId: subscriber._id,
                                type: 'suppressed',
                                source: `resend:${args.eventType}`,
                                createdAt: now,
                            });
                        }
                    }
                }
                await ctx.scheduler.runAfter(0, internal.mailingWorkers.finalizeCampaign, { campaignId: recipient.campaignId });
                outcome = 'processed';
            } else {
                const taggedOutboxId = args.notificationOutboxId
                    ? ctx.db.normalizeId('notificationOutbox', args.notificationOutboxId)
                    : null;
                const outbox =
                    (taggedOutboxId ? await ctx.db.get(taggedOutboxId) : null) ??
                    (await ctx.db
                        .query('notificationOutbox')
                        .withIndex('by_provider_message_id', (q) => q.eq('providerMessageId', args.providerMessageId))
                        .unique());
                if (outbox) {
                    await ctx.db.insert('orderEvents', {
                        orderId: outbox.orderId,
                        type: `notification.${args.eventType.replace('email.', '')}`,
                        stripeEventId: null,
                        detailsJson: args.summaryJson,
                        createdAt: now,
                    });
                    if (adverse(args.eventType)) {
                        const order = await ctx.db.get(outbox.orderId);
                        if (order) await ctx.db.patch(order._id, { fulfillmentStatus: 'needs_attention', updatedAt: now });
                    }
                    outcome = 'processed';
                }
            }
        }

        await ctx.db.insert('resendWebhookEvents', {
            svixId: args.svixId,
            eventType: args.eventType,
            providerMessageId: args.providerMessageId,
            status: outcome,
            eventAt: args.eventAt,
            summaryJson: args.summaryJson,
            createdAt: now,
            processedAt: now,
        });
        return { outcome };
    },
});
