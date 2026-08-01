import { internalQuery } from './_generated/server';
import { finishedArtworkDimensions } from '../shared/artworkDimensions';
import { estimateArtworkShipping, shippingCareForMedium } from '../shared/shipping';

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
            stripeWebhookInbox,
            notificationOutbox,
            resendWebhookEvents,
            reconciliationFindings,
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
            ctx.db.query('stripeWebhookInbox').collect(),
            ctx.db.query('notificationOutbox').collect(),
            ctx.db.query('resendWebhookEvents').collect(),
            ctx.db.query('commerceReconciliationFindings').collect(),
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
            failedStripeWebhookInbox: stripeWebhookInbox.filter((item) => item.status === 'failed').length,
            failedNotificationOutbox: notificationOutbox.filter((item) => item.status === 'failed').length,
            failedResendWebhookEvents: resendWebhookEvents.filter((item) => item.status === 'failed').length,
            openReconciliationFindings: reconciliationFindings.filter((item) => item.status === 'open').length,
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

export const framedDimensionAudit = internalQuery({
    args: {},
    handler: async (ctx) => {
        const artworks = (await ctx.db.query('artworks').collect()).filter(
            (item) => item.active && !item.absentFromSource && item.framed,
        );
        const rows = artworks.map((artwork) => {
            const finished = finishedArtworkDimensions({
                framed: artwork.framed,
                widthInches: artwork.widthInches,
                heightInches: artwork.heightInches,
                framedWidthInches: artwork.framedWidthInches,
                framedHeightInches: artwork.framedHeightInches,
                framedDimensionsVerified: artwork.framedDimensionsVerified,
            });
            const status = artwork.sold ? 'sold' : artwork.available ? 'available' : 'private';
            const oldShipping = estimateArtworkShipping({
                width: artwork.widthInches ?? 0,
                height: artwork.heightInches ?? 0,
                framed: true,
                care: shippingCareForMedium(artwork.medium),
            });
            const newShipping = finished
                ? estimateArtworkShipping({
                      width: finished.widthInches,
                      height: finished.heightInches,
                      framed: true,
                      care: shippingCareForMedium(artwork.medium),
                  })
                : null;
            return {
                legacyId: artwork.legacyId,
                title: artwork.title,
                status,
                confidence: !finished ? 'missing' : finished.estimated ? 'estimated' : 'verified',
                artworkDimensions: artwork.widthInches && artwork.heightInches ? `${artwork.widthInches} × ${artwork.heightInches}` : null,
                finishedDimensions: finished ? `${finished.widthInches} × ${finished.heightInches}` : null,
                currentTier: oldShipping.classification,
                currentChargeCents: oldShipping.checkoutChargeCents,
                proposedTier: newShipping?.classification ?? null,
                proposedChargeCents: newShipping?.checkoutChargeCents ?? null,
                deltaCents:
                    oldShipping.checkoutChargeCents !== null && newShipping?.checkoutChargeCents !== null && newShipping?.checkoutChargeCents !== undefined
                        ? newShipping.checkoutChargeCents - oldShipping.checkoutChargeCents
                        : null,
            };
        });
        const count = (status: string, confidence: string) => rows.filter((row) => row.status === status && row.confidence === confidence).length;
        return {
            total: rows.length,
            byStatus: Object.fromEntries(
                ['available', 'sold', 'private'].map((status) => [
                    status,
                    {
                        total: rows.filter((row) => row.status === status).length,
                        missing: count(status, 'missing'),
                        estimated: count(status, 'estimated'),
                        verified: count(status, 'verified'),
                    },
                ]),
            ),
            availableMissing: rows.filter((row) => row.status === 'available' && row.confidence === 'missing').length,
            shippingChanges: rows.filter((row) => row.deltaCents !== null && row.deltaCents !== 0),
            rows,
        };
    },
});
