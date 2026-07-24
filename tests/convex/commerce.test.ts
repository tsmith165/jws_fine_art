import { convexTest } from 'convex-test';
import { beforeEach, describe, expect, it } from 'vitest';
import { api } from '../../convex/_generated/api';
import schema from '../../convex/schema';

const modules = (import.meta as ImportMeta & { glob(pattern: string): Record<string, () => Promise<unknown>> }).glob(
    '../../convex/**/*.ts',
);
const serverSecret = 'test-server-secret';

function createHarness() {
    return convexTest(schema, modules);
}

async function seedArtwork(
    t: ReturnType<typeof createHarness>,
    overrides: Partial<{
        legacyId: number;
        title: string;
        active: boolean;
        available: boolean;
        sold: boolean;
        priceCents: number;
        galleryOrder: number;
        homepageOrder: number;
        framed: boolean;
        widthInches: number;
        heightInches: number;
        medium: string;
        instagramUrl: string | null;
    }> = {},
) {
    return t.run(async (ctx) => {
        const now = Date.now();
        const legacyId = overrides.legacyId ?? 101;
        const title = overrides.title ?? 'Test Artwork';
        const galleryOrder = overrides.galleryOrder ?? 1000;
        const homepageOrder = overrides.homepageOrder ?? 1000;
        const artworkId = await ctx.db.insert('artworks', {
            origin: 'legacy',
            legacyTable: 'Pieces',
            legacyId,
            sourceHash: `test-artwork-${legacyId}`,
            slug: `test-artwork-${legacyId}`,
            title,
            description: null,
            medium: overrides.medium ?? 'Oil on panel',
            theme: 'Coast',
            instagramUrl: overrides.instagramUrl ?? null,
            ownerNotes: null,
            className: 'test_artwork',
            legacyGalleryOrder: galleryOrder,
            legacyHomepagePriority: homepageOrder,
            priceCents: overrides.priceCents ?? 95000,
            sold: overrides.sold ?? false,
            available: overrides.available ?? true,
            active: overrides.active ?? true,
            framed: overrides.framed ?? true,
            widthInches: overrides.widthInches ?? 16,
            heightInches: overrides.heightInches ?? 20,
            galleryOrder,
            homepageOrder,
            ownerMutatedFields: [],
            ownerRevision: 0,
            importedAt: now,
            updatedAt: now,
            absentFromSource: false,
        });
        await ctx.db.insert('artworkMedia', {
            legacyTable: 'Pieces',
            legacyId,
            artworkLegacyId: legacyId,
            sourceHash: `test-media-${legacyId}`,
            role: 'primary',
            title: null,
            sourceUrl: 'https://example.com/artwork.jpg',
            sourceWidth: 1600,
            sourceHeight: 2000,
            smallUrl: null,
            smallWidth: null,
            smallHeight: null,
            displayOrder: 0,
            ownerMutatedFields: [],
            ownerRevision: 0,
            importedAt: now,
            updatedAt: now,
            absentFromSource: false,
        });
        return artworkId;
    });
}

const buyer = {
    buyerName: 'Test Buyer',
    buyerEmail: 'BUYER@example.com',
    buyerPhone: '555-555-0100',
    shippingAddress: '100 Test Street, San Diego, CA 92101',
    destination: 'domestic' as const,
};

beforeEach(() => {
    process.env.CONVEX_SERVER_WRITE_SECRET = serverSecret;
    delete process.env.JWS_WRITE_FREEZE;
});

describe('Convex commerce', () => {
    it('rejects unavailable or non-positive-price artwork', async () => {
        const t = createHarness();
        await seedArtwork(t, { available: false, priceCents: 0 });

        await expect(
            t.mutation(api.commerce.createCheckoutIntent, {
                serverSecret,
                artworkLegacyId: 101,
                ...buyer,
            }),
        ).rejects.toThrow('not currently available');
    });

    it('locks concurrent checkout and snapshots canonical totals', async () => {
        const t = createHarness();
        await seedArtwork(t);

        const first = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });

        expect(first).toMatchObject({ artworkPriceCents: 95000, shippingCents: 7500, totalCents: 102500, currency: 'usd' });
        await expect(
            t.mutation(api.commerce.createCheckoutIntent, {
                serverSecret,
                artworkLegacyId: 101,
                ...buyer,
            }),
        ).rejects.toThrow('already in progress');
    });

    it('calculates domestic shipping from canonical size and framing', async () => {
        const t = createHarness();
        await seedArtwork(t);

        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
            destination: 'domestic',
        });

        expect(intent).toMatchObject({
            artworkPriceCents: 95000,
            shippingCents: 7500,
            totalCents: 102500,
            international: false,
        });
        expect(intent.shippingDescription).toContain('Medium insured delivery');
    });

    it('charges nothing for local pickup and records a pickup fulfillment', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
            destination: 'pickup',
        });
        expect(intent).toMatchObject({
            shippingCents: 0,
            totalCents: 95000,
            deliveryMethod: 'local_pickup',
            shippingTier: 'Local pickup',
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_pickup',
            paymentIntentId: 'pi_pickup',
        });
        const result = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_pickup',
            eventType: 'checkout.session.completed',
            paymentIntentId: 'pi_pickup',
            checkoutSessionId: 'cs_pickup',
            amountReceivedCents: 95000,
            currency: 'usd',
            paymentStatus: 'paid',
        });
        expect(result.outcome).toBe('processed');
        const order = await t.run(async (ctx) => ctx.db.query('orders').first());
        expect(order).toMatchObject({
            deliveryMethod: 'local_pickup',
            shippingPaidCents: 0,
            shippingAddress: '',
            fulfillmentStatus: 'ready_for_pickup',
        });
    });

    it('waits for the authoritative Checkout Session when automatic tax is enabled and requires its shipping address', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
            shippingAddress: undefined,
            automaticTaxEnabled: true,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_tax',
            paymentIntentId: 'pi_tax',
        });

        const paymentIntent = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_tax_pi',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_tax',
            checkoutSessionId: 'cs_tax',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(paymentIntent.outcome).toBe('ignored');

        const missingAddress = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_tax_session_missing_address',
            eventType: 'checkout.session.completed',
            paymentIntentId: 'pi_tax',
            checkoutSessionId: 'cs_tax',
            amountReceivedCents: 102500,
            currency: 'usd',
            paymentStatus: 'paid',
            taxCents: 7500,
        });
        expect(missingAddress).toMatchObject({ outcome: 'quarantined', reason: expect.stringContaining('shipping address') });

        const completed = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_tax_session',
            eventType: 'checkout.session.completed',
            paymentIntentId: 'pi_tax',
            checkoutSessionId: 'cs_tax',
            amountReceivedCents: 102500,
            currency: 'usd',
            paymentStatus: 'paid',
            taxCents: 7500,
            shippingAddress: '123 Coast Highway\nSan Diego, CA, 92101\nUS',
        });
        expect(completed.outcome).toBe('processed');
        const order = await t.run(async (ctx) => ctx.db.query('orders').first());
        expect(order).toMatchObject({
            taxPaidCents: 7500,
            taxIncluded: true,
            shippingAddress: '123 Coast Highway\nSan Diego, CA, 92101\nUS',
        });
    });

    it('requires a studio quote for international delivery', async () => {
        const t = createHarness();
        await seedArtwork(t);
        await expect(
            t.mutation(api.commerce.createCheckoutIntent, {
                serverSecret,
                artworkLegacyId: 101,
                ...buyer,
                destination: 'international',
            }),
        ).rejects.toThrow('studio shipping quote');
    });

    it('requires a studio quote instead of charging an unreliable oversize amount', async () => {
        const t = createHarness();
        await seedArtwork(t, { widthInches: 60, heightInches: 40 });

        await expect(
            t.mutation(api.commerce.createCheckoutIntent, {
                serverSecret,
                artworkLegacyId: 101,
                ...buyer,
                destination: 'domestic',
            }),
        ).rejects.toThrow('studio shipping quote');
    });

    it('creates one canonical order, marks the artwork sold, and deduplicates Stripe replay', async () => {
        const t = createHarness();
        const artworkId = await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_test_1',
            paymentIntentId: 'pi_test_1',
        });

        const processed = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_success_1',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_test_1',
            checkoutSessionId: 'cs_test_1',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(processed.outcome).toBe('processed');
        expect('notification' in processed && processed.notification?.buyerEmail).toBe('buyer@example.com');

        const replay = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_success_1',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_test_1',
            checkoutSessionId: 'cs_test_1',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        const secondEvent = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_success_2',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_test_1',
            checkoutSessionId: 'cs_test_1',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(replay.outcome).toBe('duplicate');
        expect(secondEvent.outcome).toBe('duplicate');

        const state = await t.run(async (ctx) => ({
            artwork: await ctx.db.get(artworkId),
            orders: await ctx.db.query('orders').collect(),
            events: await ctx.db.query('stripeEvents').collect(),
        }));
        expect(state.artwork).toMatchObject({ sold: true, available: false });
        expect(state.orders).toHaveLength(1);
        expect(state.orders[0]).toMatchObject({ paymentIntentId: 'pi_test_1', amountPaidCents: 102500, shippingPaidCents: 7500 });
        expect(state.events).toHaveLength(2);
    });

    it('refuses a late second payment after the one-of-one artwork has already sold', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const first = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: first.intentId,
            sessionId: 'cs_first',
            paymentIntentId: 'pi_first',
        });
        await t.run(async (ctx) => {
            await ctx.db.patch(first.intentId, { updatedAt: Date.now() - 32 * 60 * 1000 });
        });
        const second = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: second.intentId,
            sessionId: 'cs_second',
            paymentIntentId: 'pi_second',
        });
        const paid = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_second_paid',
            eventType: 'checkout.session.completed',
            paymentIntentId: 'pi_second',
            checkoutSessionId: 'cs_second',
            amountReceivedCents: 102500,
            currency: 'usd',
            paymentStatus: 'paid',
        });
        expect(paid.outcome).toBe('processed');
        const late = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_first_late',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_first',
            checkoutSessionId: 'cs_first',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(late).toMatchObject({
            outcome: 'quarantined',
            reason: expect.stringContaining('already purchased'),
        });
        const orders = await t.run(async (ctx) => ctx.db.query('orders').collect());
        expect(orders).toHaveLength(1);
    });

    it('records partial and full refunds without automatically relisting the artwork', async () => {
        const t = createHarness();
        const artworkId = await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_refund',
            paymentIntentId: 'pi_refund',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_paid_refund',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_refund',
            checkoutSessionId: 'cs_refund',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_partial_refund',
            eventType: 'charge.refunded',
            paymentIntentId: 'pi_refund',
            checkoutSessionId: 'cs_refund',
            amountReceivedCents: 20000,
            currency: 'usd',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_full_refund',
            eventType: 'charge.refunded',
            paymentIntentId: 'pi_refund',
            checkoutSessionId: 'cs_refund',
            amountReceivedCents: 102500,
            currency: 'usd',
        });

        const state = await t.run(async (ctx) => ({
            artwork: await ctx.db.get(artworkId),
            orders: await ctx.db.query('orders').collect(),
            events: await ctx.db.query('orderEvents').collect(),
        }));
        expect(state.artwork).toMatchObject({ sold: true, available: false });
        expect(state.orders[0]).toMatchObject({ status: 'refunded', refundedCents: 102500, fulfillmentStatus: 'needs_attention' });
        expect(state.events.map((event) => event.type)).toEqual(expect.arrayContaining(['payment.partially_refunded', 'payment.refunded']));
    });

    it('records disputes as owner attention events', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, { serverSecret, artworkLegacyId: 101, ...buyer });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_dispute',
            paymentIntentId: 'pi_dispute',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_dispute_paid',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_dispute',
            checkoutSessionId: 'cs_dispute',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        const result = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_dispute_opened',
            eventType: 'charge.dispute.created',
            paymentIntentId: 'pi_dispute',
            checkoutSessionId: 'cs_dispute',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(result.outcome).toBe('processed');
        const state = await t.run(async (ctx) => ({
            events: await ctx.db.query('orderEvents').collect(),
            orders: await ctx.db.query('orders').collect(),
        }));
        expect(state.events.map((event) => event.type)).toContain('payment.dispute.created');
        expect(state.orders[0].disputeStatus).toBe('open');
    });

    it('returns a server-authorized checkout confirmation status', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, { serverSecret, artworkLegacyId: 101, ...buyer });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_status',
            paymentIntentId: 'pi_status',
        });
        const open = await t.query(api.commerce.checkoutStatus, { serverSecret, sessionId: 'cs_status', artworkLegacyId: 101 });
        expect(open).toMatchObject({ intentStatus: 'checkout_open', orderRecorded: false });
        expect(await t.query(api.commerce.checkoutStatus, { serverSecret, sessionId: 'cs_status', artworkLegacyId: 999 })).toBeNull();
    });

    it('blocks new checkouts while allowing webhook drain during a checkout freeze', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, { serverSecret, artworkLegacyId: 101, ...buyer });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_freeze',
            paymentIntentId: 'pi_freeze',
        });
        process.env.JWS_WRITE_FREEZE = 'checkout';
        await expect(t.mutation(api.commerce.createCheckoutIntent, { serverSecret, artworkLegacyId: 101, ...buyer })).rejects.toThrow(
            'temporarily paused',
        );
        const drained = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_freeze_drain',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_freeze',
            checkoutSessionId: 'cs_freeze',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(drained.outcome).toBe('processed');
    });

    it('quarantines unknown and mismatched payments exactly once', async () => {
        const t = createHarness();
        await seedArtwork(t);

        const unknown = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_unknown',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_unknown',
            checkoutSessionId: null,
            amountReceivedCents: 95000,
            currency: 'usd',
        });
        expect(unknown.outcome).toBe('quarantined');

        const replay = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_unknown',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_unknown',
            checkoutSessionId: null,
            amountReceivedCents: 95000,
            currency: 'usd',
        });
        expect(replay.outcome).toBe('quarantined');

        const state = await t.run(async (ctx) => ({
            quarantine: await ctx.db.query('webhookQuarantine').collect(),
            events: await ctx.db.query('stripeEvents').collect(),
        }));
        expect(state.quarantine).toHaveLength(1);
        expect(state.events).toHaveLength(1);
    });

    it('ignores unrelated Stripe events without creating quarantine noise', async () => {
        const t = createHarness();
        const result = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_charge',
            eventType: 'charge.updated',
            paymentIntentId: null,
            checkoutSessionId: null,
            amountReceivedCents: null,
            currency: null,
        });
        expect(result.outcome).toBe('ignored');

        const state = await t.run(async (ctx) => ({
            quarantine: await ctx.db.query('webhookQuarantine').collect(),
            events: await ctx.db.query('stripeEvents').collect(),
        }));
        expect(state.quarantine).toHaveLength(0);
        expect(state.events).toHaveLength(1);
        expect(state.events[0].status).toBe('ignored');
    });

    it('cancels a matching checkout intent and quarantines a mismatched successful amount', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const canceledIntent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: canceledIntent.intentId,
            sessionId: 'cs_cancel',
            paymentIntentId: 'pi_cancel',
        });
        const canceled = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_cancel',
            eventType: 'payment_intent.canceled',
            paymentIntentId: 'pi_cancel',
            checkoutSessionId: 'cs_cancel',
            amountReceivedCents: null,
            currency: 'usd',
        });
        expect(canceled.outcome).toBe('processed');

        const secondIntent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: secondIntent.intentId,
            sessionId: 'cs_mismatch',
            paymentIntentId: 'pi_mismatch',
        });
        const mismatch = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_mismatch',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_mismatch',
            checkoutSessionId: 'cs_mismatch',
            amountReceivedCents: 1,
            currency: 'usd',
        });
        expect(mismatch.outcome).toBe('quarantined');

        const state = await t.run(async (ctx) => ({
            artwork: await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 101))
                .unique(),
            intents: await ctx.db.query('checkoutIntents').collect(),
            orders: await ctx.db.query('orders').collect(),
            quarantine: await ctx.db.query('webhookQuarantine').collect(),
        }));
        expect(state.artwork).toMatchObject({ sold: false, available: true });
        expect(state.intents.find((intent) => intent._id === canceledIntent.intentId)).toMatchObject({
            status: 'canceled',
            cancelReason: 'buyer_cancel',
        });
        expect(state.orders).toHaveLength(0);
        expect(state.quarantine).toHaveLength(1);
    });

    it('keeps a declined Checkout session locked until Stripe expires or cancels it', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_declined',
            paymentIntentId: null,
        });

        const declined = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_declined',
            eventType: 'payment_intent.payment_failed',
            paymentIntentId: 'pi_declined',
            checkoutSessionId: 'cs_declined',
            amountReceivedCents: null,
            currency: 'usd',
        });

        expect(declined.outcome).toBe('processed');
        expect(await t.run(async (ctx) => (await ctx.db.get(intent.intentId))?.status)).toBe('checkout_open');
        await expect(
            t.mutation(api.commerce.createCheckoutIntent, {
                serverSecret,
                artworkLegacyId: 101,
                ...buyer,
            }),
        ).rejects.toThrow('already in progress');
    });

    it('expires a checkout intent when its Stripe Checkout Session expires before payment', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_expired',
            paymentIntentId: null,
        });

        const result = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_session_expired',
            eventType: 'checkout.session.expired',
            paymentIntentId: null,
            checkoutSessionId: 'cs_expired',
            amountReceivedCents: 102500,
            currency: 'usd',
        });

        expect(result.outcome).toBe('processed');
        const state = await t.run(async (ctx) => ({
            checkout: await ctx.db.get(intent.intentId),
            events: await ctx.db.query('stripeEvents').collect(),
            quarantine: await ctx.db.query('webhookQuarantine').collect(),
        }));
        expect(state.checkout?.status).toBe('expired');
        expect(state.events).toHaveLength(1);
        expect(state.events[0]).toMatchObject({ eventType: 'checkout.session.expired', status: 'processed' });
        expect(state.quarantine).toHaveLength(0);
    });

    it('reprocesses a quarantined event after its checkout session becomes identifiable', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const firstAttempt = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_recoverable_expiration',
            eventType: 'checkout.session.expired',
            paymentIntentId: null,
            checkoutSessionId: 'cs_recoverable',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        expect(firstAttempt.outcome).toBe('quarantined');

        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_recoverable',
            paymentIntentId: null,
        });
        const replay = await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_recoverable_expiration',
            eventType: 'checkout.session.expired',
            paymentIntentId: null,
            checkoutSessionId: 'cs_recoverable',
            amountReceivedCents: 102500,
            currency: 'usd',
        });

        expect(replay.outcome).toBe('processed');
        const state = await t.run(async (ctx) => ({
            checkout: await ctx.db.get(intent.intentId),
            events: await ctx.db.query('stripeEvents').collect(),
            quarantine: await ctx.db.query('webhookQuarantine').collect(),
        }));
        expect(state.checkout?.status).toBe('expired');
        expect(state.events).toHaveLength(1);
        expect(state.events[0].status).toBe('processed');
        expect(state.quarantine).toHaveLength(1);
        expect(state.quarantine[0].status).toBe('resolved');
        expect(state.quarantine[0].resolvedAt).toEqual(expect.any(Number));
    });
});

describe('owner authorization', () => {
    it('rejects anonymous owner reads and accepts an ADMIN identity', async () => {
        const t = createHarness();
        await expect(t.query(api.ownerWorkspace.dashboard, {})).rejects.toThrow('Owner access is required');

        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const dashboard = await owner.query(api.ownerWorkspace.dashboard, {});
        expect(dashboard.artwork.total).toBe(0);
    });

    it('keeps owner reads available while freezing owner mutations', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        process.env.JWS_WRITE_FREEZE = 'owner';
        expect((await owner.query(api.ownerWorkspace.dashboard, {})).artwork.total).toBe(1);
        await expect(owner.mutation(api.ownerMutations.setArtworkActive, { legacyId: 101, active: false })).rejects.toThrow(
            'temporarily paused',
        );
    });

    it('updates only artwork categories and records an owner audit event', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });

        const result = await owner.mutation(api.ownerMutations.setArtworkCategories, {
            legacyId: 101,
            categories: ['coastal', 'urban'],
        });

        expect(result).toEqual({ changed: true, categories: ['coastal', 'urban'] });
        const state = await t.run(async (ctx) => ({
            artwork: await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 101))
                .unique(),
            auditEvents: await ctx.db.query('ownerAuditEvents').collect(),
        }));
        expect(state.artwork?.categories).toEqual(['coastal', 'urban']);
        expect(state.artwork?.title).toBe('Test Artwork');
        expect(state.artwork?.ownerMutatedFields).toContain('categories');
        expect(state.auditEvents).toHaveLength(1);
        expect(state.auditEvents[0]).toMatchObject({ action: 'artwork.categories_updated', actorId: 'owner-test' });
    });

    it('repairs a legacy Instagram share reference when the editor loads it', async () => {
        const t = createHarness();
        await seedArtwork(t, { instagramUrl: '?igsh=Mzc3ZTVlOWMwZA%3D%3D' });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });

        const result = await owner.mutation(api.ownerMutations.repairArtworkInstagramShareToken, { legacyId: 101 });

        expect(result).toEqual({ changed: true });
        const state = await t.run(async (ctx) => ({
            artwork: await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 101))
                .unique(),
            auditEvents: await ctx.db.query('ownerAuditEvents').collect(),
        }));
        expect(state.artwork?.instagramUrl).toBe('Mzc3ZTVlOWMwZA%3D%3D');
        expect(state.artwork?.ownerMutatedFields).toContain('instagramUrl');
        expect(state.auditEvents[0]).toMatchObject({
            action: 'artwork.instagram_share_token_repaired',
            actorId: 'owner-test',
        });
    });

    it('lets the owner record an external sale and the original release date', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const releasedAt = Date.UTC(2023, 8, 17, 12);

        await owner.mutation(api.ownerMutations.updateArtwork, {
            legacyId: 101,
            title: 'Test Artwork',
            description: null,
            medium: 'Oil on panel',
            theme: 'Coast',
            instagramUrl: null,
            ownerNotes: 'Sold directly from the studio.',
            priceCents: 95000,
            releasedAt,
            sold: true,
            available: false,
            active: true,
            framed: true,
            widthInches: 16,
            heightInches: 20,
        });

        const artwork = await t.run((ctx) =>
            ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 101))
                .unique(),
        );
        expect(artwork).toMatchObject({ sold: true, available: false, releasedAt });
        expect(artwork?.ownerMutatedFields).toEqual(expect.arrayContaining(['sold', 'available', 'releasedAt']));
    });

    it('audits artwork edits, ordering, archive, restore, and media operations', async () => {
        const t = createHarness();
        await seedArtwork(t, { legacyId: 101, galleryOrder: 1000, homepageOrder: 1000 });
        await seedArtwork(t, { legacyId: 102, title: 'Second Artwork', galleryOrder: 2000, homepageOrder: 2000 });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });

        await owner.mutation(api.ownerMutations.updateArtwork, {
            legacyId: 101,
            title: 'Owner Updated',
            description: 'Updated from the owner workspace.',
            medium: 'Oil on panel',
            theme: 'Coast',
            instagramUrl: null,
            ownerNotes: 'Private note',
            priceCents: 120000,
            releasedAt: Date.UTC(2024, 5, 1, 12),
            sold: false,
            available: true,
            active: true,
            framed: true,
            widthInches: 16,
            heightInches: 20,
        });
        await owner.mutation(api.ownerMutations.swapArtworkOrder, {
            currentLegacyId: 101,
            targetLegacyId: 102,
            kind: 'gallery',
        });
        await owner.mutation(api.ownerMutations.setArtworkActive, { legacyId: 101, active: false });
        await owner.mutation(api.ownerMutations.setArtworkActive, { legacyId: 101, active: true });
        const added = await owner.mutation(api.ownerMutations.storeArtworkMedia, {
            artworkLegacyId: 101,
            role: 'supporting',
            title: null,
            sourceUrl: 'https://example.com/detail.jpg',
            sourceWidth: 1200,
            sourceHeight: 900,
            smallUrl: null,
            smallWidth: null,
            smallHeight: null,
        });
        const secondAdded = await owner.mutation(api.ownerMutations.storeArtworkMedia, {
            artworkLegacyId: 101,
            role: 'supporting',
            title: null,
            sourceUrl: 'https://example.com/second-detail.jpg',
            sourceWidth: 900,
            sourceHeight: 1200,
            smallUrl: null,
            smallWidth: null,
            smallHeight: null,
        });
        await owner.mutation(api.ownerMutations.swapMediaOrder, {
            currentMediaId: added.mediaId,
            targetMediaId: secondAdded.mediaId,
            role: 'supporting',
        });
        await expect(
            owner.mutation(api.ownerMutations.reorderArtworkMedia, {
                artworkLegacyId: 101,
                role: 'supporting',
                mediaIds: [added.mediaId],
            }),
        ).rejects.toThrow('The media list changed');
        await owner.mutation(api.ownerMutations.reorderArtworkMedia, {
            artworkLegacyId: 101,
            role: 'supporting',
            mediaIds: [added.mediaId, secondAdded.mediaId],
        });
        await owner.mutation(api.ownerMutations.updateMediaTitle, {
            mediaId: added.mediaId,
            role: 'supporting',
            title: 'Detail view',
        });
        await owner.mutation(api.ownerMutations.updateMediaDimensions, {
            mediaId: secondAdded.mediaId,
            role: 'supporting',
            sourceWidth: 1800,
            sourceHeight: 2400,
            smallWidth: null,
            smallHeight: null,
        });
        await owner.mutation(api.ownerMutations.storeArtworkMedia, {
            artworkLegacyId: 101,
            role: 'primary',
            title: null,
            sourceUrl: 'https://example.com/replacement-primary.jpg',
            sourceWidth: 2000,
            sourceHeight: 2500,
            smallUrl: null,
            smallWidth: null,
            smallHeight: null,
        });
        await owner.mutation(api.ownerMutations.archiveMedia, { mediaId: added.mediaId, role: 'supporting' });

        const state = await t.run(async (ctx) => ({
            first: await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 101))
                .unique(),
            second: await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 102))
                .unique(),
            media: await ctx.db.query('artworkMedia').collect(),
            audit: await ctx.db.query('ownerAuditEvents').collect(),
        }));
        expect(state.first).toMatchObject({ title: 'Owner Updated', active: true, galleryOrder: 3000, priceCents: 120000 });
        expect(state.second?.galleryOrder).toBe(1000);
        expect(state.media.find((item) => item.legacyId === added.mediaId)).toMatchObject({
            title: 'Detail view',
            absentFromSource: true,
            displayOrder: 11000,
        });
        expect(state.media.find((item) => item.legacyId === secondAdded.mediaId)).toMatchObject({
            sourceWidth: 1800,
            sourceHeight: 2400,
            displayOrder: 12000,
        });
        expect(state.media.find((item) => item.legacyId === 101 && item.role === 'primary')).toMatchObject({
            sourceUrl: 'https://example.com/replacement-primary.jpg',
            sourceWidth: 2000,
            sourceHeight: 2500,
        });
        expect(state.audit.map((event) => event.action)).toEqual(
            expect.arrayContaining([
                'artwork.updated',
                'artwork.reordered',
                'artwork.archived',
                'artwork.restored',
                'media.added',
                'media.reordered',
                'media.title_updated',
                'media.dimensions_verified',
                'media.primary_replaced',
                'media.archived',
            ]),
        );
    });

    it('creates owner artwork with a collision-free legacy-compatible identity', async () => {
        const t = createHarness();
        await seedArtwork(t, { legacyId: 101 });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const created = await owner.mutation(api.ownerMutations.createArtwork, {
            title: 'New Owner Work',
            description: null,
            medium: 'Oil on panel',
            theme: 'Coast',
            instagramUrl: null,
            ownerNotes: null,
            priceCents: 45000,
            releasedAt: Date.UTC(2025, 2, 14, 12),
            sold: false,
            available: true,
            active: true,
            framed: false,
            widthInches: 8,
            heightInches: 10,
            primaryImage: {
                sourceUrl: 'https://example.com/new-work.jpg',
                sourceWidth: 800,
                sourceHeight: 1000,
                smallUrl: null,
                smallWidth: null,
                smallHeight: null,
            },
        });
        expect(created.legacyId).toBe(102);

        const state = await t.run(async (ctx) => ({
            artwork: await ctx.db
                .query('artworks')
                .withIndex('by_legacy_id', (q) => q.eq('legacyId', 102))
                .unique(),
            media: await ctx.db
                .query('artworkMedia')
                .withIndex('by_artwork_and_order', (q) => q.eq('artworkLegacyId', 102))
                .collect(),
        }));
        expect(state.artwork).toMatchObject({
            origin: 'owner',
            title: 'New Owner Work',
            releasedAt: Date.UTC(2025, 2, 14, 12),
        });
        expect(state.media).toHaveLength(1);
        expect(state.media[0]).toMatchObject({ legacyTable: 'Owner', role: 'primary' });
    });
});

describe('public and owner workspace writes', () => {
    it('rate limits repeated public inquiries without storing the rejected request', async () => {
        const t = createHarness();
        const request = {
            serverSecret,
            artworkLegacyId: null,
            kind: 'general' as const,
            name: 'Collector Name',
            email: 'collector@example.com',
            phone: null,
            message: 'Please share more information about the studio.',
            sourcePath: '/contact',
            rateLimitKey: 'inquiry:test:rate-limit',
        };
        for (let index = 0; index < 4; index += 1) {
            await t.mutation(api.publicWrites.submitInquiry, request);
        }
        await expect(t.mutation(api.publicWrites.submitInquiry, request)).rejects.toThrow('Please wait before trying again.');
        const inquiries = await t.run((ctx) => ctx.db.query('inquiries').collect());
        expect(inquiries).toHaveLength(4);
    });

    it('stores inquiries and records subscriber consent, unsubscribe, and resubscribe events', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const inquiry = await t.mutation(api.publicWrites.submitInquiry, {
            serverSecret,
            artworkLegacyId: 101,
            kind: 'artwork',
            name: 'Collector Name',
            email: 'Collector@Example.com',
            phone: null,
            message: 'I would like to ask about this painting.',
            sourcePath: '/work/test-artwork-101',
            rateLimitKey: 'inquiry:test:collector',
        });
        expect(inquiry.inquiryId).toBeTruthy();

        await t.mutation(api.publicWrites.subscribe, {
            serverSecret,
            email: 'Collector@Example.com',
            name: 'Collector Name',
            consentSource: 'footer',
            rateLimitKey: 'subscribe:test:collector:initial',
        });
        await t.mutation(api.publicWrites.unsubscribe, {
            serverSecret,
            email: 'collector@example.com',
            source: 'unsubscribe-page',
        });
        await t.mutation(api.publicWrites.subscribe, {
            serverSecret,
            email: 'collector@example.com',
            name: null,
            consentSource: 'footer',
            rateLimitKey: 'subscribe:test:collector:resubscribe',
        });

        const state = await t.run(async (ctx) => ({
            inquiries: await ctx.db.query('inquiries').collect(),
            subscribers: await ctx.db.query('subscribers').collect(),
            events: await ctx.db.query('subscriptionEvents').collect(),
        }));
        expect(state.inquiries[0]).toMatchObject({ artworkLegacyId: 101, email: 'collector@example.com', status: 'new' });
        expect(state.subscribers).toHaveLength(1);
        expect(state.subscribers[0].status).toBe('subscribed');
        expect(state.events.map((event) => event.type)).toEqual(['consented', 'unsubscribed', 'resubscribed']);
    });

    it('deduplicates Resend webhooks and suppresses a subscriber after a campaign bounce', async () => {
        const t = createHarness();
        await t.mutation(api.publicWrites.subscribe, {
            serverSecret,
            email: 'collector@example.com',
            name: 'Collector Name',
            consentSource: 'footer',
            rateLimitKey: 'subscribe:test:resend-webhook',
        });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const campaign = await owner.mutation(api.ownerWorkspace.saveCampaign, {
            campaignId: null,
            name: 'Studio note',
            subject: 'A new painting',
            previewText: 'From the studio',
            contentJson: JSON.stringify({ headline: 'A new painting', body: 'Hello' }),
            renderedHtml: '<p>Hello</p>',
            renderedText: 'A new painting\n\nHello',
        });
        const send = await owner.mutation(api.ownerWorkspace.beginCampaignSend, { campaignId: campaign.campaignId });
        await owner.mutation(api.ownerWorkspace.recordCampaignRecipientOutcome, {
            recipientId: send.recipients[0].recipientId,
            outcome: 'sent',
            providerMessageId: 'email_bounce_test',
        });

        const first = await t.mutation(api.mailing.processResendWebhook, {
            serverSecret,
            svixId: 'msg_attempt_1',
            eventType: 'email.bounced',
            providerMessageId: 'email_bounce_test',
            eventAt: Date.now(),
            summaryJson: JSON.stringify({ bounceType: 'Permanent', message: 'Mailbox does not exist.' }),
        });
        const duplicate = await t.mutation(api.mailing.processResendWebhook, {
            serverSecret,
            svixId: 'msg_attempt_1',
            eventType: 'email.bounced',
            providerMessageId: 'email_bounce_test',
            eventAt: Date.now(),
            summaryJson: JSON.stringify({ bounceType: 'Permanent', message: 'Mailbox does not exist.' }),
        });
        expect(first.outcome).toBe('processed');
        expect(duplicate.outcome).toBe('duplicate');

        const state = await t.run(async (ctx) => ({
            subscribers: await ctx.db.query('subscribers').collect(),
            recipients: await ctx.db.query('campaignRecipients').collect(),
            webhookEvents: await ctx.db.query('resendWebhookEvents').collect(),
            subscriptionEvents: await ctx.db.query('subscriptionEvents').collect(),
        }));
        expect(state.subscribers[0]).toMatchObject({ status: 'suppressed' });
        expect(state.subscribers[0].suppressionReason).toContain('email.bounced');
        expect(state.recipients[0].status).toBe('bounced');
        expect(state.webhookEvents).toHaveLength(1);
        expect(state.subscriptionEvents.map((event) => event.type)).toEqual(['consented', 'suppressed']);
    });

    it('reconciles canonical orders against Stripe payment snapshots and records fees without buyer data', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_reconcile',
            paymentIntentId: 'pi_reconcile',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_reconcile',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_reconcile',
            checkoutSessionId: 'cs_reconcile',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const now = Date.now();
        const runId = await owner.mutation(api.ownerBusiness.beginReconciliation, {
            livemode: false,
            stripeWindowStart: now - 60_000,
            stripeWindowEnd: now + 60_000,
        });
        const result = await owner.mutation(api.ownerBusiness.completeReconciliation, {
            runId,
            payments: [
                {
                    paymentIntentId: 'pi_reconcile',
                    amountCents: 102500,
                    refundedCents: 0,
                    currency: 'usd',
                    paid: true,
                    feeCents: 3273,
                    netCents: 99227,
                },
            ],
        });
        expect(result.findings).toBe(0);
        const state = await t.run(async (ctx) => ({
            runs: await ctx.db.query('commerceReconciliationRuns').collect(),
            findings: await ctx.db.query('commerceReconciliationFindings').collect(),
        }));
        expect(state.runs[0]).toMatchObject({
            status: 'completed',
            stripePaymentCount: 1,
            canonicalOrderCount: 1,
            feeCents: 3273,
            netCents: 99227,
        });
        expect(state.findings).toHaveLength(0);
    });

    it('supersedes prior open reconciliation findings after Stripe and studio records agree', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_reconcile_recovered',
            paymentIntentId: 'pi_reconcile_recovered',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_reconcile_recovered',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_reconcile_recovered',
            checkoutSessionId: 'cs_reconcile_recovered',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const now = Date.now();
        const window = { livemode: false, stripeWindowStart: now - 60_000, stripeWindowEnd: now + 60_000 };
        const badRun = await owner.mutation(api.ownerBusiness.beginReconciliation, window);
        await owner.mutation(api.ownerBusiness.completeReconciliation, {
            runId: badRun,
            payments: [
                {
                    paymentIntentId: 'pi_reconcile_recovered',
                    amountCents: 100,
                    refundedCents: 0,
                    currency: 'usd',
                    paid: true,
                    feeCents: 10,
                    netCents: 90,
                },
            ],
        });
        const recoveredRun = await owner.mutation(api.ownerBusiness.beginReconciliation, window);
        const recovered = await owner.mutation(api.ownerBusiness.completeReconciliation, {
            runId: recoveredRun,
            payments: [
                {
                    paymentIntentId: 'pi_reconcile_recovered',
                    amountCents: 102500,
                    refundedCents: 0,
                    currency: 'usd',
                    paid: true,
                    feeCents: 3273,
                    netCents: 99227,
                },
            ],
        });
        expect(recovered.findings).toBe(0);
        const findings = await t.run(async (ctx) => ctx.db.query('commerceReconciliationFindings').collect());
        expect(findings).toHaveLength(1);
        expect(findings[0]).toMatchObject({ kind: 'amount_mismatch', status: 'resolved' });
        expect(findings[0].resolvedAt).not.toBeNull();
    });

    it('persists campaign, inquiry, content, and fulfillment state only for owners', async () => {
        const t = createHarness();
        await seedArtwork(t);
        const intent = await t.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId: 101,
            ...buyer,
        });
        await t.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: 'cs_owner_workflow',
            paymentIntentId: 'pi_owner_workflow',
        });
        await t.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: 'evt_owner_workflow',
            eventType: 'payment_intent.succeeded',
            paymentIntentId: 'pi_owner_workflow',
            checkoutSessionId: 'cs_owner_workflow',
            amountReceivedCents: 102500,
            currency: 'usd',
        });
        await t.mutation(api.commerce.recordNotificationOutcome, {
            serverSecret,
            paymentIntentId: 'pi_owner_workflow',
            outcome: 'failed',
            details: 'Synthetic provider failure.',
        });
        const inquiry = await t.mutation(api.publicWrites.submitInquiry, {
            serverSecret,
            artworkLegacyId: null,
            kind: 'general',
            name: 'Collector Name',
            email: 'collector@example.com',
            phone: null,
            message: 'Please tell me about upcoming studio events.',
            sourcePath: '/contact',
            rateLimitKey: 'inquiry:test:owner-workflow',
        });
        await t.mutation(api.publicWrites.subscribe, {
            serverSecret,
            email: 'collector@example.com',
            name: 'Collector Name',
            consentSource: 'footer',
            rateLimitKey: 'subscribe:test:owner-workflow',
        });
        const owner = t.withIdentity({ subject: 'owner-test', owner_role: 'ADMIN' });
        const order = (await owner.query(api.ownerWorkspace.listOrders, {}))[0];
        await owner.mutation(api.ownerWorkspace.updateInquiryStatus, { inquiryId: inquiry.inquiryId, status: 'replied' });
        await owner.mutation(api.ownerWorkspace.updateFulfillment, { orderId: order._id, status: 'packed' });
        const campaign = await owner.mutation(api.ownerWorkspace.saveCampaign, {
            campaignId: null,
            name: 'Studio note',
            subject: 'New work from the studio',
            previewText: 'A short update',
            contentJson: JSON.stringify({ blocks: [] }),
            renderedHtml: '<p>A short update</p>',
        });
        const send = await owner.mutation(api.ownerWorkspace.beginCampaignSend, { campaignId: campaign.campaignId });
        expect(send.recipients).toHaveLength(1);
        await owner.mutation(api.ownerWorkspace.recordCampaignRecipientOutcome, {
            recipientId: send.recipients[0].recipientId,
            outcome: 'sent',
            providerMessageId: 'email_test_1',
        });
        const completed = await owner.mutation(api.ownerWorkspace.completeCampaignSend, { campaignId: campaign.campaignId });
        expect(completed).toEqual({ status: 'sent', sent: 1, failed: 0 });
        await owner.mutation(api.ownerWorkspace.updateSiteContent, {
            key: 'home.intro',
            valueJson: JSON.stringify({ heading: 'From the studio' }),
            published: true,
        });

        const state = await t.run(async (ctx) => ({
            inquiries: await ctx.db.query('inquiries').collect(),
            orders: await ctx.db.query('orders').collect(),
            orderEvents: await ctx.db.query('orderEvents').collect(),
            campaigns: await ctx.db.query('campaigns').collect(),
            content: await ctx.db.query('siteContent').collect(),
        }));
        expect(state.inquiries[0].status).toBe('replied');
        expect(state.orders[0].fulfillmentStatus).toBe('packed');
        expect(state.orderEvents.map((event) => event.type)).toContain('fulfillment.packed');
        expect(state.orderEvents.map((event) => event.type)).toContain('notification.failed');
        expect(state.campaigns[0]).toMatchObject({ status: 'sent' });
        expect(state.campaigns[0].sentAt).not.toBeNull();
        expect(state.content[0]).toMatchObject({ key: 'home.intro', published: true, ownerRevision: 1 });
    });
});
