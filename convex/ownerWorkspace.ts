import { v } from 'convex/values';
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
            ordersToFulfill: orders.filter((item) => item.status === 'paid' && item.fulfillmentStatus === 'needs_attention').length,
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
        return (await ctx.db.query('campaigns').collect()).sort((a, b) => b.updatedAt - a.updatedAt);
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
            if (existing?.status === 'sent' || existing?.status === 'delivered') continue;
            if (existing) {
                await ctx.db.patch(existing._id, { status: 'queued', providerMessageId: null, updatedAt: now });
                recipients.push({ recipientId: existing._id, email: subscriber.email, name: subscriber.name });
            } else {
                const recipientId = await ctx.db.insert('campaignRecipients', {
                    campaignId: campaign._id,
                    subscriberId: subscriber._id,
                    providerMessageId: null,
                    status: 'queued',
                    updatedAt: now,
                });
                recipients.push({ recipientId, email: subscriber.email, name: subscriber.name });
            }
        }
        if (recipients.length === 0) throw new Error('Every subscribed recipient has already received this campaign.');
        await ctx.db.patch(campaign._id, { status: 'sending', updatedAt: now });
        return {
            campaignId: campaign._id,
            subject: campaign.subject,
            renderedHtml: campaign.renderedHtml,
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
        const queued = recipients.filter((recipient) => recipient.status === 'queued').length;
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

export const updateSiteContent = mutation({
    args: { key: v.string(), valueJson: v.string(), published: v.boolean() },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        JSON.parse(args.valueJson);
        const existing = await ctx.db.query('siteContent').withIndex('by_key', (q) => q.eq('key', args.key)).unique();
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
