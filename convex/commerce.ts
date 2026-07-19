import { v } from 'convex/values';
import { mutation, query, type MutationCtx } from './_generated/server';
import { requireServerSecret } from './lib/serverSecret';
import { assertWritesEnabled } from './lib/writeFreeze';

const nullableString = v.union(v.string(), v.null());
const nullableNumber = v.union(v.number(), v.null());

function normalizeEmail(value: string) {
    return value.trim().toLowerCase();
}

function validateBuyer(args: { buyerName: string; buyerEmail: string; buyerPhone: string; shippingAddress: string }) {
    if (args.buyerName.trim().length < 2 || args.buyerName.length > 120) throw new Error('A valid name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(args.buyerEmail))) throw new Error('A valid email is required.');
    if (args.buyerPhone.trim().length < 7 || args.buyerPhone.length > 40) throw new Error('A valid phone number is required.');
    if (args.shippingAddress.trim().length < 8 || args.shippingAddress.length > 1000)
        throw new Error('A valid shipping address is required.');
}

async function settleQuarantine(ctx: MutationCtx, eventId: string, status: 'resolved' | 'ignored') {
    const existing = await ctx.db
        .query('webhookQuarantine')
        .withIndex('by_event_id', (q) => q.eq('eventId', eventId))
        .unique();
    if (existing && existing.status === 'open') {
        await ctx.db.patch(existing._id, { status, resolvedAt: Date.now() });
    }
}

async function recordStripeEvent(
    ctx: MutationCtx,
    args: { eventId: string; eventType: string; paymentIntentId: string | null },
    status: 'processed' | 'quarantined' | 'ignored',
) {
    const existing = await ctx.db
        .query('stripeEvents')
        .withIndex('by_event_id', (q) => q.eq('eventId', args.eventId))
        .unique();
    if (existing) {
        await ctx.db.patch(existing._id, { ...args, status });
    } else {
        await ctx.db.insert('stripeEvents', { ...args, status, createdAt: Date.now() });
    }
    if (status !== 'quarantined') await settleQuarantine(ctx, args.eventId, status === 'ignored' ? 'ignored' : 'resolved');
}

async function quarantine(ctx: MutationCtx, args: { eventId: string; eventType: string; paymentIntentId: string | null }, reason: string) {
    const existing = await ctx.db
        .query('webhookQuarantine')
        .withIndex('by_event_id', (q) => q.eq('eventId', args.eventId))
        .unique();
    if (existing) {
        await ctx.db.patch(existing._id, { ...args, reason, status: 'open', resolvedAt: null });
    } else {
        await ctx.db.insert('webhookQuarantine', {
            provider: 'stripe',
            ...args,
            reason,
            status: 'open',
            createdAt: Date.now(),
            resolvedAt: null,
        });
    }
    await recordStripeEvent(ctx, args, 'quarantined');
    return { outcome: 'quarantined' as const, reason };
}

export const createCheckoutIntent = mutation({
    args: {
        serverSecret: v.string(),
        artworkLegacyId: v.number(),
        buyerName: v.string(),
        buyerEmail: v.string(),
        buyerPhone: v.string(),
        shippingAddress: v.string(),
        international: v.boolean(),
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        assertWritesEnabled('checkout');
        validateBuyer(args);
        const artwork = await ctx.db
            .query('artworks')
            .withIndex('by_legacy_id', (q) => q.eq('legacyId', args.artworkLegacyId))
            .unique();
        if (!artwork || artwork.absentFromSource || !artwork.active || !artwork.available || artwork.sold || artwork.priceCents <= 0) {
            throw new Error('This artwork is not currently available for purchase.');
        }
        const now = Date.now();
        const staleBefore = now - 31 * 60 * 1000;
        const intents = await ctx.db
            .query('checkoutIntents')
            .withIndex('by_artwork_id', (q) => q.eq('artworkId', artwork._id))
            .collect();
        const activeIntent = intents.find(
            (intent) => (intent.status === 'created' || intent.status === 'checkout_open') && intent.updatedAt > staleBefore,
        );
        if (activeIntent) throw new Error('Checkout is already in progress for this artwork. Please try again shortly.');
        for (const intent of intents.filter(
            (candidate) => (candidate.status === 'created' || candidate.status === 'checkout_open') && candidate.updatedAt <= staleBefore,
        )) {
            await ctx.db.patch(intent._id, { status: 'expired', updatedAt: now });
        }
        const media = await ctx.db
            .query('artworkMedia')
            .withIndex('by_artwork_and_order', (q) => q.eq('artworkLegacyId', artwork.legacyId))
            .collect();
        const primaryImage = media.find((item) => item.role === 'primary' && !item.absentFromSource)?.sourceUrl ?? null;
        const shippingCents = args.international ? 2500 : 0;
        const intentId = await ctx.db.insert('checkoutIntents', {
            artworkId: artwork._id,
            artworkLegacyId: artwork.legacyId,
            artworkTitle: artwork.title,
            artworkSlug: artwork.slug,
            artworkPriceCents: artwork.priceCents,
            shippingCents,
            totalCents: artwork.priceCents + shippingCents,
            currency: 'usd',
            buyerEmail: normalizeEmail(args.buyerEmail),
            buyerName: args.buyerName.trim(),
            buyerPhone: args.buyerPhone.trim(),
            shippingAddressJson: JSON.stringify({ formatted: args.shippingAddress.trim() }),
            international: args.international,
            stripeCheckoutSessionId: null,
            stripePaymentIntentId: null,
            status: 'created',
            createdAt: now,
            updatedAt: now,
        });
        return {
            intentId,
            artworkTitle: artwork.title,
            artworkSlug: artwork.slug,
            imageUrl: primaryImage,
            artworkPriceCents: artwork.priceCents,
            shippingCents,
            totalCents: artwork.priceCents + shippingCents,
            currency: 'usd',
        };
    },
});

export const attachCheckoutSession = mutation({
    args: {
        serverSecret: v.string(),
        checkoutIntentId: v.id('checkoutIntents'),
        sessionId: v.string(),
        paymentIntentId: nullableString,
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const intent = await ctx.db.get(args.checkoutIntentId);
        if (!intent || intent.status !== 'created') throw new Error('Checkout intent is no longer open.');
        const existing = await ctx.db
            .query('checkoutIntents')
            .withIndex('by_session_id', (q) => q.eq('stripeCheckoutSessionId', args.sessionId))
            .unique();
        if (existing && existing._id !== intent._id) throw new Error('Stripe session is already attached to another checkout.');
        await ctx.db.patch(intent._id, {
            stripeCheckoutSessionId: args.sessionId,
            stripePaymentIntentId: args.paymentIntentId,
            status: 'checkout_open',
            updatedAt: Date.now(),
        });
        return { success: true };
    },
});

export const abandonCheckoutIntent = mutation({
    args: { serverSecret: v.string(), checkoutIntentId: v.id('checkoutIntents') },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const intent = await ctx.db.get(args.checkoutIntentId);
        if (intent && (intent.status === 'created' || intent.status === 'checkout_open')) {
            await ctx.db.patch(intent._id, { status: 'canceled', updatedAt: Date.now() });
        }
        return { success: true };
    },
});

export const checkoutStatus = query({
    args: { serverSecret: v.string(), sessionId: v.string(), artworkLegacyId: v.number() },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const intent = await ctx.db
            .query('checkoutIntents')
            .withIndex('by_session_id', (q) => q.eq('stripeCheckoutSessionId', args.sessionId))
            .unique();
        if (!intent || intent.artworkLegacyId !== args.artworkLegacyId) return null;
        const order = intent.stripePaymentIntentId
            ? await ctx.db
                  .query('orders')
                  .withIndex('by_payment_intent_id', (q) => q.eq('paymentIntentId', intent.stripePaymentIntentId))
                  .unique()
            : null;
        return {
            intentId: String(intent._id),
            intentStatus: intent.status,
            orderRecorded: Boolean(order),
            orderStatus: order?.status ?? null,
        };
    },
});

export const processStripeEvent = mutation({
    args: {
        serverSecret: v.string(),
        eventId: v.string(),
        eventType: v.string(),
        paymentIntentId: nullableString,
        checkoutSessionId: nullableString,
        amountReceivedCents: nullableNumber,
        currency: nullableString,
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const eventIdentity = { eventId: args.eventId, eventType: args.eventType, paymentIntentId: args.paymentIntentId };
        const processed = await ctx.db
            .query('stripeEvents')
            .withIndex('by_event_id', (q) => q.eq('eventId', args.eventId))
            .unique();
        if (processed && processed.status !== 'quarantined') return { outcome: 'duplicate' as const };

        const handledEventTypes = new Set([
            'checkout.session.expired',
            'payment_intent.succeeded',
            'payment_intent.payment_failed',
            'payment_intent.canceled',
            'charge.refunded',
            'charge.dispute.created',
            'charge.dispute.updated',
            'charge.dispute.closed',
        ]);
        if (!handledEventTypes.has(args.eventType)) {
            await recordStripeEvent(ctx, eventIdentity, 'ignored');
            return { outcome: 'ignored' as const, notification: null };
        }

        let intent = args.paymentIntentId
            ? await ctx.db
                  .query('checkoutIntents')
                  .withIndex('by_payment_intent_id', (q) => q.eq('stripePaymentIntentId', args.paymentIntentId))
                  .unique()
            : null;
        if (!intent && args.checkoutSessionId) {
            intent = await ctx.db
                .query('checkoutIntents')
                .withIndex('by_session_id', (q) => q.eq('stripeCheckoutSessionId', args.checkoutSessionId))
                .unique();
        }
        if (!intent) return quarantine(ctx, eventIdentity, 'No canonical checkout intent matches this verified Stripe event.');

        if (args.eventType === 'charge.refunded' || args.eventType.startsWith('charge.dispute.')) {
            if (!args.paymentIntentId) return quarantine(ctx, eventIdentity, 'The Stripe event did not include a payment intent ID.');
            const order = await ctx.db
                .query('orders')
                .withIndex('by_payment_intent_id', (q) => q.eq('paymentIntentId', args.paymentIntentId))
                .unique();
            if (!order) return quarantine(ctx, eventIdentity, 'No canonical order matches this verified Stripe event.');
            const now = Date.now();
            if (args.eventType === 'charge.refunded') {
                const refundedCents = args.amountReceivedCents;
                if (
                    !Number.isSafeInteger(refundedCents) ||
                    refundedCents! < 0 ||
                    refundedCents! > (order.amountPaidCents ?? 0) ||
                    args.currency !== order.currency
                ) {
                    return quarantine(ctx, eventIdentity, 'Stripe refund amount or currency is inconsistent with the canonical order.');
                }
                const fullyRefunded = refundedCents === order.amountPaidCents;
                await ctx.db.patch(order._id, {
                    ...(fullyRefunded ? { status: 'refunded' as const } : {}),
                    fulfillmentStatus: 'needs_attention',
                    updatedAt: now,
                });
                await ctx.db.insert('orderEvents', {
                    orderId: order._id,
                    type: fullyRefunded ? 'payment.refunded' : 'payment.partially_refunded',
                    stripeEventId: args.eventId,
                    detailsJson: JSON.stringify({ refundedCents, currency: args.currency }),
                    createdAt: now,
                });
            } else {
                await ctx.db.patch(order._id, { fulfillmentStatus: 'needs_attention', updatedAt: now });
                await ctx.db.insert('orderEvents', {
                    orderId: order._id,
                    type: args.eventType.replace('charge.', 'payment.'),
                    stripeEventId: args.eventId,
                    detailsJson: JSON.stringify({ amountCents: args.amountReceivedCents, currency: args.currency }),
                    createdAt: now,
                });
            }
            await recordStripeEvent(ctx, eventIdentity, 'processed');
            return { outcome: 'processed' as const, notification: null };
        }

        if (args.eventType === 'payment_intent.payment_failed') {
            await ctx.db.patch(intent._id, {
                status: 'checkout_open',
                stripePaymentIntentId: args.paymentIntentId ?? intent.stripePaymentIntentId,
                updatedAt: Date.now(),
            });
            await recordStripeEvent(ctx, eventIdentity, 'processed');
            return { outcome: 'processed' as const, notification: null };
        }
        if (args.eventType === 'checkout.session.expired' || args.eventType === 'payment_intent.canceled') {
            await ctx.db.patch(intent._id, {
                status: args.eventType === 'payment_intent.canceled' ? 'canceled' : 'expired',
                stripePaymentIntentId: args.paymentIntentId ?? intent.stripePaymentIntentId,
                updatedAt: Date.now(),
            });
            await recordStripeEvent(ctx, eventIdentity, 'processed');
            return { outcome: 'processed' as const, notification: null };
        }
        if (!args.paymentIntentId) return quarantine(ctx, eventIdentity, 'A successful payment did not include a payment intent ID.');
        const amountReceivedCents = args.amountReceivedCents;
        if (!Number.isSafeInteger(amountReceivedCents) || amountReceivedCents !== intent.totalCents || args.currency !== intent.currency) {
            return quarantine(ctx, eventIdentity, 'Stripe amount or currency does not match the canonical checkout snapshot.');
        }
        const existingOrder = await ctx.db
            .query('orders')
            .withIndex('by_payment_intent_id', (q) => q.eq('paymentIntentId', args.paymentIntentId))
            .unique();
        if (existingOrder) {
            await recordStripeEvent(ctx, eventIdentity, 'processed');
            return { outcome: 'duplicate' as const };
        }
        const artwork = await ctx.db.get(intent.artworkId);
        if (!artwork) return quarantine(ctx, eventIdentity, 'Checkout artwork no longer exists.');
        const media = await ctx.db
            .query('artworkMedia')
            .withIndex('by_artwork_and_order', (q) => q.eq('artworkLegacyId', artwork.legacyId))
            .collect();
        const primaryImage = media.find((item) => item.role === 'primary' && !item.absentFromSource)?.sourceUrl ?? null;
        const now = Date.now();
        const address = JSON.parse(intent.shippingAddressJson) as { formatted?: string };
        const orderId = await ctx.db.insert('orders', {
            source: 'stripe',
            legacySourceIds: [],
            legacyStripeId: null,
            paymentIntentId: args.paymentIntentId,
            checkoutIntentId: intent._id,
            artworkId: artwork._id,
            artworkLegacyId: artwork.legacyId,
            artworkTitle: intent.artworkTitle,
            artworkImageUrl: primaryImage,
            legacyRecordedPriceCents: null,
            amountPaidCents: amountReceivedCents,
            shippingPaidCents: intent.shippingCents,
            currency: intent.currency,
            buyerName: intent.buyerName,
            buyerPhone: intent.buyerPhone,
            buyerEmail: intent.buyerEmail,
            shippingAddress: address.formatted ?? '',
            international: intent.international,
            purchasedOn: new Date(now).toISOString(),
            status: 'paid',
            fulfillmentStatus: 'needs_attention',
            createdAt: now,
            updatedAt: now,
        });
        await ctx.db.insert('orderEvents', {
            orderId,
            type: 'payment.succeeded',
            stripeEventId: args.eventId,
            detailsJson: JSON.stringify({ amountReceivedCents, currency: intent.currency }),
            createdAt: now,
        });
        await ctx.db.patch(intent._id, {
            status: 'paid',
            stripePaymentIntentId: args.paymentIntentId,
            updatedAt: now,
        });
        await ctx.db.patch(artwork._id, {
            sold: true,
            available: false,
            ownerMutatedFields: [...new Set([...artwork.ownerMutatedFields, 'sold', 'available'])],
            ownerRevision: artwork.ownerRevision + 1,
            updatedAt: now,
        });
        await recordStripeEvent(ctx, eventIdentity, 'processed');
        return {
            outcome: 'processed' as const,
            notification: {
                buyerEmail: intent.buyerEmail,
                buyerName: intent.buyerName,
                artworkTitle: intent.artworkTitle,
                shippingAddress: address.formatted ?? '',
                amountPaidCents: amountReceivedCents,
            },
        };
    },
});

export const recordNotificationOutcome = mutation({
    args: {
        serverSecret: v.string(),
        paymentIntentId: v.string(),
        outcome: v.union(v.literal('sent'), v.literal('failed')),
        details: v.string(),
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const order = await ctx.db
            .query('orders')
            .withIndex('by_payment_intent_id', (q) => q.eq('paymentIntentId', args.paymentIntentId))
            .unique();
        if (!order) throw new Error('Order not found.');
        await ctx.db.insert('orderEvents', {
            orderId: order._id,
            type: `notification.${args.outcome}`,
            stripeEventId: null,
            detailsJson: JSON.stringify({ details: args.details }),
            createdAt: Date.now(),
        });
        if (args.outcome === 'failed' && order.fulfillmentStatus === 'untracked') {
            await ctx.db.patch(order._id, { fulfillmentStatus: 'needs_attention', updatedAt: Date.now() });
        }
        return { success: true };
    },
});
