import { internalQuery } from './_generated/server';

export const audit = internalQuery({
    args: {},
    handler: async (ctx) => {
        const [
            legacyPieces,
            legacyExtraImages,
            legacyProgressImages,
            legacyPendingTransactions,
            legacyVerifiedTransactions,
            artworks,
            artworkMedia,
            checkoutIntents,
            orders,
            quarantines,
            migrationConflicts,
            campaigns,
            campaignRecipients,
            inquiries,
            subscribers,
            siteContent,
            ownerAuditEvents,
        ] = await Promise.all([
            ctx.db.query('legacyPieces').collect(),
            ctx.db.query('legacyExtraImages').collect(),
            ctx.db.query('legacyProgressImages').collect(),
            ctx.db.query('legacyPendingTransactions').collect(),
            ctx.db.query('legacyVerifiedTransactions').collect(),
            ctx.db.query('artworks').collect(),
            ctx.db.query('artworkMedia').collect(),
            ctx.db.query('checkoutIntents').collect(),
            ctx.db.query('orders').collect(),
            ctx.db.query('webhookQuarantine').collect(),
            ctx.db.query('migrationConflicts').collect(),
            ctx.db.query('campaigns').collect(),
            ctx.db.query('campaignRecipients').collect(),
            ctx.db.query('inquiries').collect(),
            ctx.db.query('subscribers').collect(),
            ctx.db.query('siteContent').collect(),
            ctx.db.query('ownerAuditEvents').collect(),
        ]);
        return {
            rawCounts: {
                legacyPieces: legacyPieces.length,
                legacyExtraImages: legacyExtraImages.length,
                legacyProgressImages: legacyProgressImages.length,
                legacyPendingTransactions: legacyPendingTransactions.length,
                legacyVerifiedTransactions: legacyVerifiedTransactions.length,
            },
            canonicalCounts: {
                artworks: artworks.filter((item) => !item.absentFromSource).length,
                artworkMedia: artworkMedia.filter((item) => !item.absentFromSource).length,
                orders: orders.length,
                inquiries: inquiries.length,
                subscribers: subscribers.length,
                campaigns: campaigns.length,
                campaignRecipients: campaignRecipients.length,
                siteContent: siteContent.length,
                ownerAuditEvents: ownerAuditEvents.length,
            },
            openCheckoutIntents: checkoutIntents.filter((item) => item.status === 'created' || item.status === 'checkout_open').length,
            openWebhookQuarantines: quarantines.filter((item) => item.status === 'open').length,
            migrationConflicts: migrationConflicts.length,
            campaignsSending: campaigns.filter((item) => item.status === 'sending').length,
            failedCampaignRecipients: campaignRecipients.filter((item) => item.status === 'failed').length,
        };
    },
});

export const mediaInventory = internalQuery({
    args: {},
    handler: async (ctx) => {
        const media = await ctx.db.query('artworkMedia').collect();
        return media
            .filter((item) => !item.absentFromSource)
            .flatMap((item) => [item.sourceUrl, item.smallUrl])
            .filter((url): url is string => Boolean(url));
    },
});
