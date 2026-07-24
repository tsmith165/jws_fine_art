import { v } from 'convex/values';
import { internal } from './_generated/api';
import { mutation, query } from './_generated/server';
import { requireOwnerIdentity } from './lib/ownerAuth';

export const dashboard = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        const [artworks, inquiries, orders, subscribers, campaigns] = await Promise.all([
            ctx.db.query('artworks').collect(),
            ctx.db.query('inquiries').collect(),
            ctx.db.query('orders').collect(),
            ctx.db.query('subscribers').collect(),
            ctx.db.query('campaigns').collect(),
        ]);
        return {
            artwork: {
                total: artworks.filter((item) => !item.absentFromSource).length,
                active: artworks.filter((item) => item.active && !item.absentFromSource).length,
                available: artworks.filter((item) => item.active && item.available && !item.sold && item.priceCents > 0).length,
                needsDetails: artworks.filter(
                    (item) =>
                        item.active &&
                        !item.absentFromSource &&
                        (!item.medium || !item.widthInches || !item.heightInches || (!item.sold && item.priceCents <= 0)),
                ).length,
            },
            newInquiries: inquiries.filter((item) => item.status === 'new').length,
            ordersToFulfill: orders.filter(
                (item) =>
                    item.status === 'paid' &&
                    (item.fulfillmentStatus === 'needs_attention' || item.fulfillmentStatus === 'ready_for_pickup'),
            ).length,
            subscribers: subscribers.filter((item) => item.status === 'subscribed').length,
            draftCampaigns: campaigns.filter((item) => item.status === 'draft').length,
            recentInquiries: inquiries.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
            recentOrders: orders.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5),
        };
    },
});

export const listInquiries = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        return (await ctx.db.query('inquiries').collect()).sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const listSubscribers = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        return (await ctx.db.query('subscribers').collect()).sort((a, b) => b.updatedAt - a.updatedAt);
    },
});

export const listCampaigns = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        const campaigns = (await ctx.db.query('campaigns').collect()).sort((a, b) => b.updatedAt - a.updatedAt);
        return Promise.all(
            campaigns.map(async (campaign) => {
                const recipients = await ctx.db
                    .query('campaignRecipients')
                    .withIndex('by_campaign_id', (q) => q.eq('campaignId', campaign._id))
                    .collect();
                return {
                    ...campaign,
                    outcomes: {
                        total: recipients.length,
                        queued: recipients.filter((item) => item.status === 'queued' || item.status === 'sending').length,
                        accepted: recipients.filter((item) => ['sent', 'delivered', 'delayed'].includes(item.status)).length,
                        delivered: recipients.filter((item) => item.status === 'delivered').length,
                        bounced: recipients.filter((item) => item.status === 'bounced').length,
                        complained: recipients.filter((item) => item.status === 'complained').length,
                        failed: recipients.filter((item) => item.status === 'failed').length,
                        suppressed: recipients.filter((item) => item.status === 'suppressed' || item.status === 'skipped').length,
                    },
                };
            }),
        );
    },
});

export const mailingOverview = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        const [subscribers, campaigns, recipients, webhookEvents] = await Promise.all([
            ctx.db.query('subscribers').collect(),
            ctx.db.query('campaigns').collect(),
            ctx.db.query('campaignRecipients').collect(),
            ctx.db.query('resendWebhookEvents').collect(),
        ]);
        const now = Date.now();
        const recentEvents = webhookEvents.filter((item) => item.createdAt >= now - 30 * 24 * 60 * 60 * 1000);
        return {
            subscribers: {
                active: subscribers.filter((item) => item.status === 'subscribed').length,
                unsubscribed: subscribers.filter((item) => item.status === 'unsubscribed').length,
                suppressed: subscribers.filter((item) => item.status === 'suppressed').length,
            },
            campaigns: {
                draft: campaigns.filter((item) => item.status === 'draft').length,
                sending: campaigns.filter((item) => item.status === 'sending').length,
                failed: campaigns.filter((item) => item.status === 'failed').length,
                sent: campaigns.filter((item) => item.status === 'sent').length,
            },
            delivery: {
                delivered: recipients.filter((item) => item.status === 'delivered').length,
                delayed: recipients.filter((item) => item.status === 'delayed').length,
                bounced: recipients.filter((item) => item.status === 'bounced').length,
                complained: recipients.filter((item) => item.status === 'complained').length,
                failed: recipients.filter((item) => item.status === 'failed').length,
            },
            provider: {
                webhookEventsLast30Days: recentEvents.length,
                failedWebhookEventsLast30Days: recentEvents.filter((item) => item.status === 'failed').length,
                lastWebhookAt: webhookEvents.sort((a, b) => b.createdAt - a.createdAt)[0]?.createdAt ?? null,
            },
        };
    },
});

export const listOrders = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        return (await ctx.db.query('orders').collect()).sort((a, b) => b.createdAt - a.createdAt);
    },
});

export const getSiteContent = query({
    args: {},
    handler: async (ctx) => {
        await requireOwnerIdentity(ctx);
        return (await ctx.db.query('siteContent').collect()).sort((a, b) => a.key.localeCompare(b.key));
    },
});

export const updateInquiryStatus = mutation({
    args: { inquiryId: v.id('inquiries'), status: v.union(v.literal('new'), v.literal('replied'), v.literal('closed')) },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const inquiry = await ctx.db.get(args.inquiryId);
        if (!inquiry) throw new Error('Inquiry not found.');
        await ctx.db.patch(inquiry._id, { status: args.status, updatedAt: Date.now() });
        return { success: true };
    },
});

export const updateFulfillment = mutation({
    args: {
        orderId: v.id('orders'),
        status: v.union(
            v.literal('untracked'),
            v.literal('needs_attention'),
            v.literal('packed'),
            v.literal('shipped'),
            v.literal('delivered'),
            v.literal('ready_for_pickup'),
            v.literal('picked_up'),
        ),
    },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const order = await ctx.db.get(args.orderId);
        if (!order) throw new Error('Order not found.');
        const now = Date.now();
        await ctx.db.patch(order._id, { fulfillmentStatus: args.status, updatedAt: now });
        await ctx.db.insert('orderEvents', {
            orderId: order._id,
            type: `fulfillment.${args.status}`,
            stripeEventId: null,
            detailsJson: JSON.stringify({ actorId: identity.subject }),
            createdAt: now,
        });
        return { success: true };
    },
});

export const saveCampaign = mutation({
    args: {
        campaignId: v.union(v.id('campaigns'), v.null()),
        name: v.string(),
        subject: v.string(),
        previewText: v.string(),
        contentJson: v.string(),
        renderedHtml: v.string(),
        renderedText: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        if (!args.name.trim() || !args.subject.trim()) throw new Error('Campaign name and subject are required.');
        const now = Date.now();
        if (args.campaignId) {
            const campaign = await ctx.db.get(args.campaignId);
            if (!campaign || campaign.status !== 'draft') throw new Error('Only draft campaigns can be edited.');
            await ctx.db.patch(campaign._id, {
                name: args.name.trim(),
                subject: args.subject.trim(),
                previewText: args.previewText.trim(),
                contentJson: args.contentJson,
                renderedHtml: args.renderedHtml,
                renderedText: args.renderedText ?? args.subject,
                updatedAt: now,
            });
            return { campaignId: campaign._id };
        }
        const campaignId = await ctx.db.insert('campaigns', {
            name: args.name.trim(),
            subject: args.subject.trim(),
            previewText: args.previewText.trim(),
            contentJson: args.contentJson,
            renderedHtml: args.renderedHtml,
            renderedText: args.renderedText ?? args.subject,
            status: 'draft',
            createdBy: String(identity.subject),
            createdAt: now,
            updatedAt: now,
            sentAt: null,
        });
        return { campaignId };
    },
});

export const markCampaignStatus = mutation({
    args: {
        campaignId: v.id('campaigns'),
        status: v.union(v.literal('sending'), v.literal('sent'), v.literal('failed')),
    },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign) throw new Error('Campaign not found.');
        const now = Date.now();
        await ctx.db.patch(campaign._id, { status: args.status, sentAt: args.status === 'sent' ? now : campaign.sentAt, updatedAt: now });
        return { success: true };
    },
});

export const beginCampaignSend = mutation({
    args: { campaignId: v.id('campaigns') },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign || (campaign.status !== 'draft' && campaign.status !== 'failed')) {
            throw new Error('Only draft or failed campaigns can be sent.');
        }
        const subscribers = await ctx.db
            .query('subscribers')
            .withIndex('by_status', (q) => q.eq('status', 'subscribed'))
            .collect();
        if (subscribers.length === 0) throw new Error('There are no subscribed recipients.');
        const existingRecipients = await ctx.db
            .query('campaignRecipients')
            .withIndex('by_campaign_id', (q) => q.eq('campaignId', campaign._id))
            .collect();
        const existingBySubscriber = new Map(existingRecipients.map((recipient) => [recipient.subscriberId, recipient]));
        const now = Date.now();
        const recipients = [];
        for (const subscriber of subscribers) {
            const existing = existingBySubscriber.get(subscriber._id);
            if (existing && ['sent', 'delivered', 'delayed', 'bounced', 'complained', 'suppressed', 'skipped'].includes(existing.status)) {
                continue;
            }
            if (existing) {
                await ctx.db.patch(existing._id, {
                    status: 'queued',
                    providerMessageId: null,
                    attempts: 0,
                    lastError: null,
                    nextAttemptAt: now,
                    updatedAt: now,
                });
                recipients.push({ recipientId: existing._id, email: subscriber.email, name: subscriber.name });
            } else {
                const recipientId = await ctx.db.insert('campaignRecipients', {
                    campaignId: campaign._id,
                    subscriberId: subscriber._id,
                    providerMessageId: null,
                    status: 'queued',
                    attempts: 0,
                    lastError: null,
                    nextAttemptAt: now,
                    lastProviderEventAt: null,
                    sentAt: null,
                    updatedAt: now,
                });
                recipients.push({ recipientId, email: subscriber.email, name: subscriber.name });
            }
        }
        if (recipients.length === 0) throw new Error('Every subscribed recipient has already received this campaign.');
        await ctx.db.patch(campaign._id, { status: 'sending', audienceSnapshotCount: recipients.length, updatedAt: now });
        for (const recipient of recipients) {
            await ctx.scheduler.runAfter(0, internal.mailingWorkers.sendCampaignRecipient, {
                recipientId: recipient.recipientId,
            });
        }
        return {
            campaignId: campaign._id,
            queued: recipients.length,
            subject: campaign.subject,
            renderedHtml: campaign.renderedHtml,
            renderedText: campaign.renderedText ?? campaign.subject,
            recipients,
        };
    },
});

export const recordCampaignRecipientOutcome = mutation({
    args: {
        recipientId: v.id('campaignRecipients'),
        outcome: v.union(v.literal('sent'), v.literal('failed')),
        providerMessageId: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const recipient = await ctx.db.get(args.recipientId);
        if (!recipient) throw new Error('Campaign recipient not found.');
        await ctx.db.patch(recipient._id, {
            status: args.outcome,
            providerMessageId: args.providerMessageId,
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});

export const completeCampaignSend = mutation({
    args: { campaignId: v.id('campaigns') },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const campaign = await ctx.db.get(args.campaignId);
        if (!campaign || campaign.status !== 'sending') throw new Error('Campaign is not currently sending.');
        const recipients = await ctx.db
            .query('campaignRecipients')
            .withIndex('by_campaign_id', (q) => q.eq('campaignId', campaign._id))
            .collect();
        const queued = recipients.filter((recipient) => recipient.status === 'queued' || recipient.status === 'sending').length;
        if (queued > 0) throw new Error('Campaign still has queued recipients.');
        const failed = recipients.filter((recipient) => recipient.status === 'failed').length;
        const sent = recipients.filter((recipient) => recipient.status === 'sent' || recipient.status === 'delivered').length;
        const now = Date.now();
        await ctx.db.patch(campaign._id, {
            status: failed > 0 ? 'failed' : 'sent',
            sentAt: sent > 0 ? now : campaign.sentAt,
            updatedAt: now,
        });
        return { status: failed > 0 ? ('failed' as const) : ('sent' as const), sent, failed };
    },
});

export const updateSubscriberStatus = mutation({
    args: {
        subscriberId: v.id('subscribers'),
        status: v.union(v.literal('subscribed'), v.literal('unsubscribed'), v.literal('suppressed')),
        reason: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const subscriber = await ctx.db.get(args.subscriberId);
        if (!subscriber) throw new Error('Subscriber not found.');
        const now = Date.now();
        await ctx.db.patch(subscriber._id, {
            status: args.status,
            suppressionReason: args.status === 'suppressed' ? args.reason.trim() || 'Suppressed by studio manager.' : null,
            unsubscribedAt: args.status === 'unsubscribed' ? now : args.status === 'subscribed' ? null : subscriber.unsubscribedAt,
            updatedAt: now,
        });
        await ctx.db.insert('subscriptionEvents', {
            subscriberId: subscriber._id,
            type: args.status === 'subscribed' ? 'resubscribed' : args.status === 'suppressed' ? 'suppressed' : 'unsubscribed',
            source: `owner:${identity.subject}:${args.reason.trim() || 'manual update'}`,
            createdAt: now,
        });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: `mailing.subscriber_${args.status}`,
            entityType: 'subscribers',
            entityId: String(subscriber._id),
            detailsJson: JSON.stringify({ reason: args.reason.trim() }),
            createdAt: now,
        });
        return { success: true };
    },
});

export const updateSiteContent = mutation({
    args: { key: v.string(), valueJson: v.string(), published: v.boolean() },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        JSON.parse(args.valueJson);
        const existing = await ctx.db
            .query('siteContent')
            .withIndex('by_key', (q) => q.eq('key', args.key))
            .unique();
        const now = Date.now();
        if (existing) {
            await ctx.db.patch(existing._id, {
                valueJson: args.valueJson,
                published: args.published,
                ownerRevision: existing.ownerRevision + 1,
                updatedBy: String(identity.subject),
                updatedAt: now,
            });
            return { contentId: existing._id };
        }
        const contentId = await ctx.db.insert('siteContent', {
            key: args.key,
            valueJson: args.valueJson,
            published: args.published,
            ownerRevision: 1,
            updatedBy: String(identity.subject),
            updatedAt: now,
        });
        return { contentId };
    },
});
