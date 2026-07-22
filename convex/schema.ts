import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const nullableString = v.union(v.string(), v.null());
const nullableNumber = v.union(v.number(), v.null());
const nullableBoolean = v.union(v.boolean(), v.null());
const artworkCategory = v.union(v.literal('coastal'), v.literal('mountain'), v.literal('urban'), v.literal('intaglio-lino-cut'));

const legacySourceFields = {
    legacyId: v.number(),
    snapshotId: v.string(),
    sourceHash: v.string(),
};

export default defineSchema({
    legacyPieces: defineTable({
        ...legacySourceFields,
        oId: v.number(),
        pId: v.number(),
        className: v.string(),
        title: v.string(),
        imagePath: v.string(),
        width: v.number(),
        height: v.number(),
        smallImagePath: nullableString,
        smallWidth: nullableNumber,
        smallHeight: nullableNumber,
        price: v.number(),
        sold: nullableBoolean,
        available: nullableBoolean,
        description: nullableString,
        pieceType: nullableString,
        instagram: nullableString,
        realWidth: nullableNumber,
        realHeight: nullableNumber,
        active: nullableBoolean,
        theme: nullableString,
        categories: v.optional(v.array(artworkCategory)),
        framed: nullableBoolean,
        comments: nullableString,
    })
        .index('by_legacy_id', ['legacyId'])
        .index('by_snapshot_id', ['snapshotId']),

    legacyExtraImages: defineTable({
        ...legacySourceFields,
        pieceLegacyId: v.number(),
        title: nullableString,
        imagePath: v.string(),
        width: v.number(),
        height: v.number(),
        smallImagePath: nullableString,
        smallWidth: nullableNumber,
        smallHeight: nullableNumber,
    })
        .index('by_legacy_id', ['legacyId'])
        .index('by_piece_legacy_id', ['pieceLegacyId'])
        .index('by_snapshot_id', ['snapshotId']),

    legacyProgressImages: defineTable({
        ...legacySourceFields,
        pieceLegacyId: v.number(),
        title: nullableString,
        imagePath: v.string(),
        width: v.number(),
        height: v.number(),
        smallImagePath: nullableString,
        smallWidth: nullableNumber,
        smallHeight: nullableNumber,
    })
        .index('by_legacy_id', ['legacyId'])
        .index('by_piece_legacy_id', ['pieceLegacyId'])
        .index('by_snapshot_id', ['snapshotId']),

    legacyPendingTransactions: defineTable({
        ...legacySourceFields,
        pieceLegacyId: v.number(),
        pieceTitle: v.string(),
        fullName: v.string(),
        phone: v.string(),
        email: v.string(),
        address: v.string(),
        international: nullableBoolean,
    })
        .index('by_legacy_id', ['legacyId'])
        .index('by_piece_legacy_id', ['pieceLegacyId'])
        .index('by_snapshot_id', ['snapshotId']),

    legacyVerifiedTransactions: defineTable({
        ...legacySourceFields,
        pieceLegacyId: v.number(),
        pieceTitle: v.string(),
        fullName: v.string(),
        phone: v.string(),
        email: v.string(),
        address: v.string(),
        international: nullableBoolean,
        imagePath: v.string(),
        imageWidth: v.number(),
        imageHeight: v.number(),
        purchasedOn: v.string(),
        stripeId: v.string(),
        price: v.number(),
    })
        .index('by_legacy_id', ['legacyId'])
        .index('by_piece_legacy_id', ['pieceLegacyId'])
        .index('by_stripe_id', ['stripeId'])
        .index('by_snapshot_id', ['snapshotId']),

    artworks: defineTable({
        origin: v.optional(v.union(v.literal('legacy'), v.literal('owner'))),
        legacyTable: v.literal('Pieces'),
        legacyId: v.number(),
        sourceHash: v.string(),
        slug: v.string(),
        title: v.string(),
        description: nullableString,
        medium: nullableString,
        theme: nullableString,
        categories: v.optional(v.array(artworkCategory)),
        instagramUrl: nullableString,
        ownerNotes: nullableString,
        className: v.string(),
        legacyGalleryOrder: v.optional(v.number()),
        legacyHomepagePriority: v.optional(v.number()),
        priceCents: v.number(),
        sold: v.boolean(),
        available: v.boolean(),
        active: v.boolean(),
        framed: v.boolean(),
        widthInches: nullableNumber,
        heightInches: nullableNumber,
        galleryOrder: v.number(),
        homepageOrder: v.number(),
        ownerMutatedFields: v.array(v.string()),
        ownerRevision: v.number(),
        importedAt: v.number(),
        updatedAt: v.number(),
        absentFromSource: v.boolean(),
    })
        .index('by_legacy_id', ['legacyId'])
        .index('by_slug', ['slug'])
        .index('by_active_gallery_order', ['active', 'galleryOrder'])
        .index('by_homepage_order', ['homepageOrder'])
        .index('by_absent_from_source', ['absentFromSource']),

    artworkMedia: defineTable({
        legacyTable: v.union(v.literal('Pieces'), v.literal('ExtraImages'), v.literal('ProgressImages'), v.literal('Owner')),
        legacyId: v.number(),
        artworkLegacyId: v.number(),
        sourceHash: v.string(),
        role: v.union(v.literal('primary'), v.literal('supporting'), v.literal('progress')),
        title: nullableString,
        sourceUrl: v.string(),
        sourceWidth: v.number(),
        sourceHeight: v.number(),
        smallUrl: nullableString,
        smallWidth: nullableNumber,
        smallHeight: nullableNumber,
        displayOrder: v.number(),
        ownerMutatedFields: v.array(v.string()),
        ownerRevision: v.number(),
        importedAt: v.number(),
        updatedAt: v.number(),
        absentFromSource: v.boolean(),
    })
        .index('by_legacy_source', ['legacyTable', 'legacyId'])
        .index('by_artwork_and_order', ['artworkLegacyId', 'displayOrder'])
        .index('by_absent_from_source', ['absentFromSource']),

    homepageRotations: defineTable({
        key: v.literal('primary'),
        artworkLegacyIds: v.array(v.number()),
        updatedAt: v.number(),
    }).index('by_key', ['key']),

    checkoutIntents: defineTable({
        artworkId: v.id('artworks'),
        artworkLegacyId: nullableNumber,
        artworkTitle: v.string(),
        artworkSlug: v.string(),
        artworkPriceCents: v.number(),
        shippingCents: v.number(),
        totalCents: v.number(),
        currency: v.string(),
        buyerEmail: v.string(),
        buyerName: v.string(),
        buyerPhone: v.string(),
        shippingAddressJson: v.string(),
        international: v.boolean(),
        stripeCheckoutSessionId: nullableString,
        stripePaymentIntentId: nullableString,
        status: v.union(v.literal('created'), v.literal('checkout_open'), v.literal('paid'), v.literal('expired'), v.literal('canceled')),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_session_id', ['stripeCheckoutSessionId'])
        .index('by_payment_intent_id', ['stripePaymentIntentId'])
        .index('by_artwork_id', ['artworkId']),

    orders: defineTable({
        source: v.union(v.literal('legacy'), v.literal('stripe')),
        legacySourceIds: v.array(v.number()),
        legacyStripeId: nullableString,
        paymentIntentId: nullableString,
        checkoutIntentId: v.union(v.id('checkoutIntents'), v.null()),
        artworkId: v.union(v.id('artworks'), v.null()),
        artworkLegacyId: nullableNumber,
        artworkTitle: v.string(),
        artworkImageUrl: nullableString,
        legacyRecordedPriceCents: nullableNumber,
        amountPaidCents: nullableNumber,
        shippingPaidCents: nullableNumber,
        currency: v.string(),
        buyerName: v.string(),
        buyerPhone: v.string(),
        buyerEmail: v.string(),
        shippingAddress: v.string(),
        international: v.boolean(),
        purchasedOn: nullableString,
        status: v.union(v.literal('legacy_verified'), v.literal('paid'), v.literal('refunded'), v.literal('canceled')),
        fulfillmentStatus: v.union(
            v.literal('untracked'),
            v.literal('needs_attention'),
            v.literal('packed'),
            v.literal('shipped'),
            v.literal('delivered'),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_legacy_stripe_id', ['legacyStripeId'])
        .index('by_payment_intent_id', ['paymentIntentId'])
        .index('by_status', ['status'])
        .index('by_artwork_legacy_id', ['artworkLegacyId']),

    orderEvents: defineTable({
        orderId: v.id('orders'),
        type: v.string(),
        stripeEventId: nullableString,
        detailsJson: v.string(),
        createdAt: v.number(),
    })
        .index('by_order_id', ['orderId'])
        .index('by_stripe_event_id', ['stripeEventId']),

    webhookQuarantine: defineTable({
        provider: v.literal('stripe'),
        eventId: v.string(),
        eventType: v.string(),
        paymentIntentId: nullableString,
        reason: v.string(),
        status: v.union(v.literal('open'), v.literal('resolved'), v.literal('ignored')),
        createdAt: v.number(),
        resolvedAt: nullableNumber,
    })
        .index('by_event_id', ['eventId'])
        .index('by_status', ['status']),

    stripeEvents: defineTable({
        eventId: v.string(),
        eventType: v.string(),
        paymentIntentId: nullableString,
        status: v.union(v.literal('processed'), v.literal('quarantined'), v.literal('ignored')),
        createdAt: v.number(),
    })
        .index('by_event_id', ['eventId'])
        .index('by_payment_intent_id', ['paymentIntentId']),

    ownerAuditEvents: defineTable({
        actorId: v.string(),
        action: v.string(),
        entityType: v.string(),
        entityId: v.string(),
        detailsJson: v.string(),
        createdAt: v.number(),
    })
        .index('by_entity', ['entityType', 'entityId'])
        .index('by_created_at', ['createdAt']),

    inquiries: defineTable({
        artworkId: v.union(v.id('artworks'), v.null()),
        artworkLegacyId: nullableNumber,
        kind: v.union(v.literal('artwork'), v.literal('commission'), v.literal('general')),
        name: v.string(),
        email: v.string(),
        phone: nullableString,
        message: v.string(),
        status: v.union(v.literal('new'), v.literal('replied'), v.literal('closed')),
        sourcePath: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_status', ['status'])
        .index('by_artwork_id', ['artworkId']),

    subscribers: defineTable({
        email: v.string(),
        normalizedEmail: v.string(),
        name: nullableString,
        status: v.union(v.literal('subscribed'), v.literal('unsubscribed'), v.literal('suppressed')),
        consentSource: v.string(),
        consentedAt: nullableNumber,
        unsubscribedAt: nullableNumber,
        providerContactId: nullableString,
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index('by_normalized_email', ['normalizedEmail'])
        .index('by_status', ['status']),

    subscriptionEvents: defineTable({
        subscriberId: v.id('subscribers'),
        type: v.union(v.literal('consented'), v.literal('unsubscribed'), v.literal('suppressed'), v.literal('resubscribed')),
        source: v.string(),
        createdAt: v.number(),
    }).index('by_subscriber_id', ['subscriberId']),

    publicRateLimits: defineTable({
        key: v.string(),
        action: v.union(v.literal('inquiry'), v.literal('subscribe')),
        windowStartedAt: v.number(),
        count: v.number(),
        updatedAt: v.number(),
    }).index('by_key', ['key']),

    campaigns: defineTable({
        name: v.string(),
        subject: v.string(),
        previewText: v.string(),
        contentJson: v.string(),
        renderedHtml: v.string(),
        status: v.union(v.literal('draft'), v.literal('sending'), v.literal('sent'), v.literal('failed')),
        createdBy: v.string(),
        createdAt: v.number(),
        updatedAt: v.number(),
        sentAt: nullableNumber,
    }).index('by_status', ['status']),

    campaignRecipients: defineTable({
        campaignId: v.id('campaigns'),
        subscriberId: v.id('subscribers'),
        providerMessageId: nullableString,
        status: v.union(v.literal('queued'), v.literal('sent'), v.literal('delivered'), v.literal('bounced'), v.literal('failed')),
        updatedAt: v.number(),
    })
        .index('by_campaign_id', ['campaignId'])
        .index('by_subscriber_id', ['subscriberId']),

    siteContent: defineTable({
        key: v.string(),
        valueJson: v.string(),
        published: v.boolean(),
        ownerRevision: v.number(),
        updatedBy: v.string(),
        updatedAt: v.number(),
    }).index('by_key', ['key']),

    migrationRuns: defineTable({
        runId: v.string(),
        snapshotId: v.string(),
        serializerVersion: v.string(),
        sourceSummaryHash: v.string(),
        status: v.union(v.literal('running'), v.literal('verified'), v.literal('failed')),
        rawCountsJson: v.string(),
        canonicalCountsJson: v.string(),
        conflicts: v.number(),
        startedAt: v.number(),
        completedAt: nullableNumber,
    })
        .index('by_run_id', ['runId'])
        .index('by_snapshot_id', ['snapshotId']),

    migrationConflicts: defineTable({
        runId: v.string(),
        sourceTable: v.string(),
        legacyId: v.number(),
        field: v.string(),
        reason: v.string(),
        sourceHash: v.string(),
        createdAt: v.number(),
    })
        .index('by_run_id', ['runId'])
        .index('by_source', ['sourceTable', 'legacyId']),
});
