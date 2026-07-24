import { v } from 'convex/values';
import { api, internal } from './_generated/api';
import { internalAction, internalMutation, internalQuery, mutation } from './_generated/server';
import { requireServerSecret } from './lib/serverSecret';

const WEBHOOK_MAX_ATTEMPTS = 6;
const EMAIL_MAX_ATTEMPTS = 6;
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000, 8 * 60 * 60_000];
const WEBHOOK_LEASE_MS = 90_000;
const EMAIL_LEASE_MS = 5 * 60_000;

type StripeWebhookPayload = {
    eventId: string;
    eventType: string;
    paymentIntentId: string | null;
    checkoutSessionId: string | null;
    amountReceivedCents: number | null;
    currency: string | null;
    paymentStatus: string | null;
    taxCents: number | null;
    customerName: string | null;
    customerEmail: string | null;
    customerPhone: string | null;
    shippingAddress: string | null;
    disputeStatus: string | null;
};

function safeError(error: unknown) {
    return error instanceof Error ? error.message.slice(0, 1000) : 'Unknown worker error.';
}

function escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character]!);
}

function money(cents: number | null) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents ?? 0) / 100);
}

function purchaseEmailHtml(order: {
    buyerName: string;
    artworkTitle: string;
    amountPaidCents: number | null;
    shippingAddress: string;
    deliveryMethod?: 'domestic_shipping' | 'local_pickup' | 'international_quote';
}) {
    const pickup = order.deliveryMethod === 'local_pickup';
    const fulfillment = pickup
        ? `<p>Jill will contact you to arrange a pickup time in San Diego County. Exact studio details are shared privately after purchase.</p>`
        : `<p>Jill will follow up with packing, tracking, and insured shipping details.</p>
           <p><strong>Shipping to</strong><br>${escapeHtml(order.shippingAddress || 'Address collected by Stripe')}</p>`;
    return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#101512;color:#f3efe5;font-family:Arial,Helvetica,sans-serif">
    <div style="display:none;max-height:0;overflow:hidden">Your JWS Fine Art purchase is confirmed.</div>
    <main style="max-width:620px;margin:0 auto;padding:40px 24px">
      <p style="margin:0 0 12px;color:#cfae6b;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">JWS Fine Art</p>
      <h1 style="margin:0 0 24px;font-family:Georgia,serif;font-size:34px;font-weight:400">Your artwork is yours.</h1>
      <p>Dear ${escapeHtml(order.buyerName)},</p>
      <p>Thank you for collecting <strong>${escapeHtml(order.artworkTitle)}</strong>. Stripe securely processed ${money(order.amountPaidCents)}.</p>
      ${fulfillment}
      <p>Sales tax is included where applicable.</p>
      <p>Questions? Reply to this email or contact <a style="color:#cfae6b" href="mailto:jwsfineart@gmail.com">jwsfineart@gmail.com</a>.</p>
      <p>Warmly,<br>Jill Weeks Smith</p>
    </main>
  </body>
</html>`;
}

function purchaseEmailText(order: {
    buyerName: string;
    artworkTitle: string;
    amountPaidCents: number | null;
    shippingAddress: string;
    deliveryMethod?: 'domestic_shipping' | 'local_pickup' | 'international_quote';
}) {
    const fulfillment =
        order.deliveryMethod === 'local_pickup'
            ? 'Jill will contact you to arrange a pickup time in San Diego County. Exact studio details are shared privately after purchase.'
            : `Jill will follow up with packing, tracking, and insured shipping details.\n\nShipping to:\n${
                  order.shippingAddress || 'Address collected by Stripe'
              }`;
    return `JWS Fine Art

Your artwork is yours.

Dear ${order.buyerName},

Thank you for collecting ${order.artworkTitle}. Stripe securely processed ${money(order.amountPaidCents)}.

${fulfillment}

Sales tax is included where applicable.

Questions? Reply to this email or contact jwsfineart@gmail.com.

Warmly,
Jill Weeks Smith`;
}

export const enqueueStripeEvent = mutation({
    args: {
        serverSecret: v.string(),
        eventId: v.string(),
        eventType: v.string(),
        livemode: v.boolean(),
        payloadJson: v.string(),
    },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const existing = await ctx.db
            .query('stripeWebhookInbox')
            .withIndex('by_event_id', (q) => q.eq('eventId', args.eventId))
            .unique();
        if (existing && existing.status !== 'failed') return { outcome: 'duplicate' as const };
        const now = Date.now();
        const inboxId = existing?._id
            ? existing._id
            : await ctx.db.insert('stripeWebhookInbox', {
                  eventId: args.eventId,
                  eventType: args.eventType,
                  livemode: args.livemode,
                  payloadJson: args.payloadJson,
                  status: 'pending',
                  attempts: 0,
                  lastError: null,
                  nextAttemptAt: now,
                  processedAt: null,
                  createdAt: now,
                  updatedAt: now,
              });
        if (existing) {
            await ctx.db.patch(existing._id, {
                payloadJson: args.payloadJson,
                status: 'pending',
                lastError: null,
                nextAttemptAt: now,
                updatedAt: now,
            });
        }
        await ctx.scheduler.runAfter(0, internal.commerceWorkers.processStripeWebhookInbox, { inboxId });
        return { outcome: 'queued' as const };
    },
});

export const getStripeWebhookInbox = internalQuery({
    args: { inboxId: v.id('stripeWebhookInbox') },
    handler: async (ctx, args) => ctx.db.get(args.inboxId),
});

export const beginStripeWebhookAttempt = internalMutation({
    args: { inboxId: v.id('stripeWebhookInbox') },
    handler: async (ctx, args) => {
        const inbox = await ctx.db.get(args.inboxId);
        if (!inbox || inbox.status === 'processed') return null;
        if (inbox.status === 'processing' && inbox.updatedAt > Date.now() - WEBHOOK_LEASE_MS) return null;
        await ctx.db.patch(inbox._id, {
            status: 'processing',
            attempts: inbox.attempts + 1,
            nextAttemptAt: null,
            updatedAt: Date.now(),
        });
        return { ...inbox, attempts: inbox.attempts + 1 };
    },
});

export const finishStripeWebhook = internalMutation({
    args: {
        inboxId: v.id('stripeWebhookInbox'),
        paymentIntentId: v.union(v.string(), v.null()),
        createNotification: v.boolean(),
    },
    handler: async (ctx, args) => {
        const inbox = await ctx.db.get(args.inboxId);
        if (!inbox) return;
        const now = Date.now();
        await ctx.db.patch(inbox._id, {
            status: 'processed',
            lastError: null,
            nextAttemptAt: null,
            processedAt: now,
            updatedAt: now,
        });
        if (!args.createNotification || !args.paymentIntentId) return;
        const order = await ctx.db
            .query('orders')
            .withIndex('by_payment_intent_id', (q) => q.eq('paymentIntentId', args.paymentIntentId))
            .unique();
        if (!order) return;
        const existing = await ctx.db
            .query('notificationOutbox')
            .withIndex('by_order_and_kind', (q) => q.eq('orderId', order._id).eq('kind', 'purchase_confirmation'))
            .unique();
        if (existing) return;
        const outboxId = await ctx.db.insert('notificationOutbox', {
            orderId: order._id,
            kind: 'purchase_confirmation',
            recipientJson: JSON.stringify([order.buyerEmail, 'jwsfineart@gmail.com']),
            subject: `Purchase confirmed: ${order.artworkTitle}`,
            status: 'pending',
            attempts: 0,
            providerMessageId: null,
            lastError: null,
            nextAttemptAt: now,
            sentAt: null,
            createdAt: now,
            updatedAt: now,
        });
        await ctx.scheduler.runAfter(0, internal.commerceWorkers.sendPurchaseConfirmation, { outboxId });
    },
});

export const failStripeWebhook = internalMutation({
    args: { inboxId: v.id('stripeWebhookInbox'), error: v.string() },
    handler: async (ctx, args) => {
        const inbox = await ctx.db.get(args.inboxId);
        if (!inbox || inbox.status === 'processed') return;
        const retry = inbox.attempts < WEBHOOK_MAX_ATTEMPTS;
        const delay = RETRY_DELAYS_MS[Math.min(Math.max(inbox.attempts - 1, 0), RETRY_DELAYS_MS.length - 1)] ?? 0;
        const now = Date.now();
        await ctx.db.patch(inbox._id, {
            status: retry ? 'pending' : 'failed',
            lastError: args.error,
            nextAttemptAt: retry ? now + delay : null,
            updatedAt: now,
        });
        if (retry) await ctx.scheduler.runAfter(delay, internal.commerceWorkers.processStripeWebhookInbox, { inboxId: inbox._id });
    },
});

export const processStripeWebhookInbox = internalAction({
    args: { inboxId: v.id('stripeWebhookInbox') },
    handler: async (ctx, args) => {
        const inbox = await ctx.runMutation(internal.commerceWorkers.beginStripeWebhookAttempt, args);
        if (!inbox) return;
        await ctx.scheduler.runAfter(WEBHOOK_LEASE_MS + 30_000, internal.commerceWorkers.processStripeWebhookInbox, args);
        try {
            const payload = JSON.parse(inbox.payloadJson) as StripeWebhookPayload;
            const serverSecret = process.env.CONVEX_SERVER_WRITE_SECRET;
            if (!serverSecret) throw new Error('CONVEX_SERVER_WRITE_SECRET is not configured for webhook processing.');
            const result = await ctx.runMutation(api.commerce.processStripeEvent, {
                serverSecret,
                ...payload,
            });
            await ctx.runMutation(internal.commerceWorkers.finishStripeWebhook, {
                inboxId: args.inboxId,
                paymentIntentId: payload.paymentIntentId,
                createNotification: result.outcome === 'processed' && 'notification' in result && Boolean(result.notification),
            });
        } catch (error) {
            await ctx.runMutation(internal.commerceWorkers.failStripeWebhook, {
                inboxId: args.inboxId,
                error: safeError(error),
            });
        }
    },
});

export const getNotificationOutbox = internalQuery({
    args: { outboxId: v.id('notificationOutbox') },
    handler: async (ctx, args) => {
        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox) return null;
        const order = await ctx.db.get(outbox.orderId);
        return order ? { outbox, order } : null;
    },
});

export const beginNotificationAttempt = internalMutation({
    args: { outboxId: v.id('notificationOutbox') },
    handler: async (ctx, args) => {
        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox || outbox.status === 'sent') return false;
        if (outbox.status === 'sending' && outbox.updatedAt > Date.now() - EMAIL_LEASE_MS) return false;
        await ctx.db.patch(outbox._id, {
            status: 'sending',
            attempts: outbox.attempts + 1,
            nextAttemptAt: null,
            updatedAt: Date.now(),
        });
        return true;
    },
});

export const finishNotificationAttempt = internalMutation({
    args: {
        outboxId: v.id('notificationOutbox'),
        success: v.boolean(),
        providerMessageId: v.union(v.string(), v.null()),
        error: v.union(v.string(), v.null()),
    },
    handler: async (ctx, args) => {
        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox || outbox.status === 'sent') return;
        const now = Date.now();
        if (args.success) {
            await ctx.db.patch(outbox._id, {
                status: 'sent',
                providerMessageId: args.providerMessageId,
                lastError: null,
                nextAttemptAt: null,
                sentAt: now,
                updatedAt: now,
            });
            await ctx.db.insert('orderEvents', {
                orderId: outbox.orderId,
                type: 'notification.sent',
                stripeEventId: null,
                detailsJson: JSON.stringify({ providerMessageId: args.providerMessageId }),
                createdAt: now,
            });
            return;
        }
        const retry = outbox.attempts < EMAIL_MAX_ATTEMPTS;
        const delay = RETRY_DELAYS_MS[Math.min(Math.max(outbox.attempts - 1, 0), RETRY_DELAYS_MS.length - 1)] ?? 0;
        await ctx.db.patch(outbox._id, {
            status: retry ? 'pending' : 'failed',
            lastError: args.error,
            nextAttemptAt: retry ? now + delay : null,
            updatedAt: now,
        });
        if (retry) {
            await ctx.scheduler.runAfter(delay, internal.commerceWorkers.sendPurchaseConfirmation, { outboxId: outbox._id });
        } else {
            await ctx.db.insert('orderEvents', {
                orderId: outbox.orderId,
                type: 'notification.failed',
                stripeEventId: null,
                detailsJson: JSON.stringify({ error: args.error, attempts: outbox.attempts }),
                createdAt: now,
            });
        }
    },
});

export const sendPurchaseConfirmation = internalAction({
    args: { outboxId: v.id('notificationOutbox') },
    handler: async (ctx, args) => {
        const claimed = await ctx.runMutation(internal.commerceWorkers.beginNotificationAttempt, args);
        if (!claimed) return;
        await ctx.scheduler.runAfter(EMAIL_LEASE_MS + 60_000, internal.commerceWorkers.sendPurchaseConfirmation, args);
        const record = await ctx.runQuery(internal.commerceWorkers.getNotificationOutbox, args);
        if (!record) return;
        try {
            const apiKey = process.env.RESEND_API_KEY;
            if (!apiKey) throw new Error('RESEND_API_KEY is not configured for durable confirmation delivery.');
            const recipients = JSON.parse(record.outbox.recipientJson) as string[];
            const [buyerEmail, ...studioCopies] = recipients;
            if (!buyerEmail) throw new Error('Purchase confirmation has no buyer recipient.');
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'Idempotency-Key': `purchase-confirmation-${record.order._id}`,
                },
                body: JSON.stringify({
                    from: 'JWS Fine Art <contact@jwsfineart.com>',
                    to: buyerEmail,
                    ...(studioCopies.length ? { bcc: studioCopies } : {}),
                    subject: record.outbox.subject,
                    html: purchaseEmailHtml(record.order),
                    text: purchaseEmailText(record.order),
                    tags: [
                        { name: 'order_id', value: String(record.order._id) },
                        { name: 'outbox_id', value: String(record.outbox._id) },
                    ],
                }),
            });
            const body = (await response.json().catch(() => null)) as { id?: string; message?: string } | null;
            if (!response.ok) throw new Error(body?.message || `Resend returned HTTP ${response.status}.`);
            await ctx.runMutation(internal.commerceWorkers.finishNotificationAttempt, {
                outboxId: args.outboxId,
                success: true,
                providerMessageId: body?.id ?? null,
                error: null,
            });
        } catch (error) {
            await ctx.runMutation(internal.commerceWorkers.finishNotificationAttempt, {
                outboxId: args.outboxId,
                success: false,
                providerMessageId: null,
                error: safeError(error),
            });
        }
    },
});
