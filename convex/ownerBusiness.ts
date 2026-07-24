import { v } from 'convex/values';
import { internal } from './_generated/api';
import type { Id } from './_generated/dataModel';
import { mutation, query, type MutationCtx } from './_generated/server';
import { requireOwnerIdentity } from './lib/ownerAuth';
import { requireServerSecret } from './lib/serverSecret';

const DAY = 24 * 60 * 60 * 1000;
function rangeStart(rangeDays: number) {
    if (!Number.isFinite(rangeDays) || rangeDays <= 0) return 0;
    return Date.now() - Math.min(rangeDays, 3650) * DAY;
}

function sum(values: Array<number | null | undefined>) {
    return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}

export const overview = query({
    args: { rangeDays: v.number() },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const since = rangeStart(args.rangeDays);
        const [allOrders, allIntents, inbox, outbox, quarantines, campaigns, recipients, subscribers, runs, findings] = await Promise.all([
            ctx.db.query('orders').collect(),
            ctx.db.query('checkoutIntents').collect(),
            ctx.db.query('stripeWebhookInbox').collect(),
            ctx.db.query('notificationOutbox').collect(),
            ctx.db.query('webhookQuarantine').collect(),
            ctx.db.query('campaigns').collect(),
            ctx.db.query('campaignRecipients').collect(),
            ctx.db.query('subscribers').collect(),
            ctx.db.query('commerceReconciliationRuns').collect(),
            ctx.db.query('commerceReconciliationFindings').collect(),
        ]);
        const orders = allOrders.filter((item) => item.createdAt >= since);
        const intents = allIntents.filter((item) => item.createdAt >= since);
        const paidOrders = orders.filter((item) => item.status === 'paid' || item.status === 'legacy_verified');
        const stripeOrders = paidOrders.filter((item) => item.source === 'stripe');
        const completedCampaigns = campaigns.filter((item) => item.sentAt && item.sentAt >= since);
        const campaignIds = new Set(completedCampaigns.map((item) => item._id));
        const campaignRecipients = recipients.filter((item) => campaignIds.has(item.campaignId));
        const latestRun = runs.sort((a, b) => b.createdAt - a.createdAt)[0] ?? null;
        const openFindings = findings.filter((item) => item.status === 'open');
        const activeSubscribers = subscribers.filter((item) => item.status === 'subscribed').length;
        const delivered = campaignRecipients.filter((item) => item.status === 'delivered').length;
        const bounced = campaignRecipients.filter((item) => item.status === 'bounced').length;
        const complained = campaignRecipients.filter((item) => item.status === 'complained').length;
        const failed = campaignRecipients.filter((item) => item.status === 'failed').length;
        const checkoutCreated = intents.length;
        const checkoutPaid = intents.filter((item) => item.status === 'paid').length;

        return {
            rangeDays: args.rangeDays,
            commerce: {
                grossCents: sum(paidOrders.map((item) => item.amountPaidCents ?? item.legacyRecordedPriceCents)),
                shippingCents: sum(stripeOrders.map((item) => item.shippingPaidCents)),
                taxCents: sum(stripeOrders.map((item) => item.taxPaidCents)),
                refundedCents: sum(orders.map((item) => item.refundedCents)),
                netCollectedCents:
                    sum(paidOrders.map((item) => item.amountPaidCents ?? item.legacyRecordedPriceCents)) -
                    sum(orders.map((item) => item.refundedCents)),
                orderCount: paidOrders.length,
                stripeOrderCount: stripeOrders.length,
                averageOrderCents: paidOrders.length
                    ? Math.round(sum(paidOrders.map((item) => item.amountPaidCents ?? item.legacyRecordedPriceCents)) / paidOrders.length)
                    : 0,
                checkoutCreated,
                checkoutPaid,
                checkoutCanceled: intents.filter((item) => item.status === 'canceled').length,
                checkoutExpired: intents.filter((item) => item.status === 'expired').length,
                conversionPercent: checkoutCreated ? Math.round((checkoutPaid / checkoutCreated) * 1000) / 10 : 0,
                delivery: {
                    shipped: stripeOrders.filter((item) => item.deliveryMethod === 'domestic_shipping').length,
                    pickup: stripeOrders.filter((item) => item.deliveryMethod === 'local_pickup').length,
                    international: stripeOrders.filter((item) => item.deliveryMethod === 'international_quote').length,
                },
                fulfillment: {
                    needsAttention: allOrders.filter(
                        (item) =>
                            item.status === 'paid' &&
                            (item.fulfillmentStatus === 'needs_attention' || item.fulfillmentStatus === 'ready_for_pickup'),
                    ).length,
                    inProgress: allOrders.filter(
                        (item) => item.status === 'paid' && ['packed', 'shipped', 'ready_for_pickup'].includes(item.fulfillmentStatus),
                    ).length,
                    completed: allOrders.filter(
                        (item) => item.status === 'paid' && ['delivered', 'picked_up'].includes(item.fulfillmentStatus),
                    ).length,
                },
            },
            operations: {
                failedStripeEvents: inbox.filter((item) => item.status === 'failed').length,
                pendingStripeEvents: inbox.filter((item) => item.status === 'pending' || item.status === 'processing').length,
                openQuarantines: quarantines.filter((item) => item.status === 'open').length,
                failedConfirmations: outbox.filter((item) => item.status === 'failed').length,
                pendingConfirmations: outbox.filter((item) => item.status === 'pending' || item.status === 'sending').length,
                openDisputes: allOrders.filter((item) => item.disputeStatus === 'open' || item.disputeStatus === 'under_review').length,
                openReconciliationFindings: openFindings.length,
                latestRun: latestRun
                    ? {
                          id: latestRun._id,
                          status: latestRun.status,
                          findingCount: latestRun.findingCount,
                          feeCents: latestRun.feeCents,
                          netCents: latestRun.netCents,
                          createdAt: latestRun.createdAt,
                          completedAt: latestRun.completedAt,
                          lastError: latestRun.lastError,
                      }
                    : null,
            },
            mailing: {
                activeSubscribers,
                suppressedSubscribers: subscribers.filter((item) => item.status === 'suppressed').length,
                unsubscribedSubscribers: subscribers.filter((item) => item.status === 'unsubscribed').length,
                campaignsSent: completedCampaigns.length,
                delivered,
                bounced,
                complained,
                failed,
                deliveryPercent: campaignRecipients.length ? Math.round((delivered / campaignRecipients.length) * 1000) / 10 : 0,
                complaintPercent: campaignRecipients.length ? Math.round((complained / campaignRecipients.length) * 10000) / 100 : 0,
            },
            alerts: [
                ...inbox
                    .filter((item) => item.status === 'failed')
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .slice(0, 8)
                    .map((item) => ({
                        id: String(item._id),
                        type: 'stripe_inbox' as const,
                        severity: 'critical' as const,
                        title: 'Stripe event needs another attempt',
                        detail: `${item.eventType} failed after ${item.attempts} attempts.`,
                        occurredAt: item.updatedAt,
                    })),
                ...quarantines
                    .filter((item) => item.status === 'open')
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 8)
                    .map((item) => ({
                        id: String(item._id),
                        type: 'quarantine' as const,
                        severity: 'critical' as const,
                        title: 'Verified payment event is quarantined',
                        detail: item.reason,
                        occurredAt: item.createdAt,
                    })),
                ...outbox
                    .filter((item) => item.status === 'failed')
                    .sort((a, b) => b.updatedAt - a.updatedAt)
                    .slice(0, 8)
                    .map((item) => ({
                        id: String(item._id),
                        type: 'confirmation' as const,
                        severity: 'warning' as const,
                        title: 'Purchase confirmation was not delivered',
                        detail: item.lastError || `Delivery stopped after ${item.attempts} attempts.`,
                        occurredAt: item.updatedAt,
                    })),
                ...openFindings
                    .sort((a, b) => b.createdAt - a.createdAt)
                    .slice(0, 8)
                    .map((item) => ({
                        id: String(item._id),
                        type: 'reconciliation' as const,
                        severity: item.severity,
                        title: item.summary,
                        detail: item.kind.replaceAll('_', ' '),
                        occurredAt: item.createdAt,
                    })),
            ].sort((a, b) => b.occurredAt - a.occurredAt),
        };
    },
});

export const retryStripeInbox = mutation({
    args: { inboxId: v.id('stripeWebhookInbox') },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const inbox = await ctx.db.get(args.inboxId);
        if (!inbox) throw new Error('Stripe inbox item not found.');
        const now = Date.now();
        await ctx.db.patch(inbox._id, { status: 'pending', lastError: null, nextAttemptAt: now, updatedAt: now });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'commerce.retry_stripe_event',
            entityType: 'stripeWebhookInbox',
            entityId: String(inbox._id),
            detailsJson: JSON.stringify({ eventType: inbox.eventType }),
            createdAt: now,
        });
        await ctx.scheduler.runAfter(0, internal.commerceWorkers.processStripeWebhookInbox, { inboxId: inbox._id });
        return { success: true };
    },
});

export const retryConfirmation = mutation({
    args: { outboxId: v.id('notificationOutbox') },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const outbox = await ctx.db.get(args.outboxId);
        if (!outbox) throw new Error('Confirmation delivery not found.');
        const now = Date.now();
        await ctx.db.patch(outbox._id, { status: 'pending', lastError: null, nextAttemptAt: now, updatedAt: now });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: 'commerce.retry_confirmation',
            entityType: 'notificationOutbox',
            entityId: String(outbox._id),
            detailsJson: '{}',
            createdAt: now,
        });
        await ctx.scheduler.runAfter(0, internal.commerceWorkers.sendPurchaseConfirmation, { outboxId: outbox._id });
        return { success: true };
    },
});

export const resolveQuarantine = mutation({
    args: {
        quarantineId: v.id('webhookQuarantine'),
        resolution: v.union(v.literal('resolved'), v.literal('ignored')),
        note: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const item = await ctx.db.get(args.quarantineId);
        if (!item) throw new Error('Quarantine item not found.');
        const now = Date.now();
        await ctx.db.patch(item._id, {
            status: args.resolution,
            resolutionNote: args.note.trim() || null,
            resolvedAt: now,
        });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: `commerce.quarantine_${args.resolution}`,
            entityType: 'webhookQuarantine',
            entityId: String(item._id),
            detailsJson: JSON.stringify({ note: args.note.trim() }),
            createdAt: now,
        });
        return { success: true };
    },
});

const paymentSnapshot = v.object({
    paymentIntentId: v.string(),
    amountCents: v.number(),
    refundedCents: v.number(),
    currency: v.string(),
    paid: v.boolean(),
    feeCents: v.union(v.number(), v.null()),
    netCents: v.union(v.number(), v.null()),
});

async function createRun(
    ctx: MutationCtx,
    args: { livemode: boolean; initiatedBy: string; stripeWindowStart: number; stripeWindowEnd: number },
) {
    return ctx.db.insert('commerceReconciliationRuns', {
        status: 'running',
        livemode: args.livemode,
        initiatedBy: args.initiatedBy,
        stripeWindowStart: args.stripeWindowStart,
        stripeWindowEnd: args.stripeWindowEnd,
        stripePaymentCount: 0,
        canonicalOrderCount: 0,
        findingCount: 0,
        feeCents: null,
        netCents: null,
        lastError: null,
        createdAt: Date.now(),
        completedAt: null,
    });
}

export const beginReconciliation = mutation({
    args: { livemode: v.boolean(), stripeWindowStart: v.number(), stripeWindowEnd: v.number() },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        return createRun(ctx, { ...args, initiatedBy: String(identity.subject) });
    },
});

export const beginReconciliationFromServer = mutation({
    args: { serverSecret: v.string(), livemode: v.boolean(), stripeWindowStart: v.number(), stripeWindowEnd: v.number() },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        return createRun(ctx, { ...args, initiatedBy: 'scheduled-reconciliation' });
    },
});

async function finishRun(
    ctx: MutationCtx,
    args: {
        runId: Id<'commerceReconciliationRuns'>;
        payments: Array<{
            paymentIntentId: string;
            amountCents: number;
            refundedCents: number;
            currency: string;
            paid: boolean;
            feeCents: number | null;
            netCents: number | null;
        }>;
    },
) {
    const run = await ctx.db.get(args.runId);
    if (!run) throw new Error('Reconciliation run not found.');
    const orders = (await ctx.db.query('orders').collect()).filter(
        (item) => item.source === 'stripe' && item.createdAt >= run.stripeWindowStart && item.createdAt <= run.stripeWindowEnd,
    );
    const ordersByPayment = new Map(orders.filter((item) => item.paymentIntentId).map((item) => [item.paymentIntentId!, item]));
    const paymentsById = new Map(args.payments.map((item) => [item.paymentIntentId, item]));
    const scopedPaymentIds = new Set(args.payments.map((item) => item.paymentIntentId));
    const scopedOrderIds = new Set(orders.map((item) => item._id));
    const previousOpenFindings = await ctx.db
        .query('commerceReconciliationFindings')
        .withIndex('by_status', (q) => q.eq('status', 'open'))
        .collect();
    const now = Date.now();
    for (const finding of previousOpenFindings) {
        if (
            (finding.paymentIntentId && scopedPaymentIds.has(finding.paymentIntentId)) ||
            (finding.orderId && scopedOrderIds.has(finding.orderId))
        ) {
            await ctx.db.patch(finding._id, { status: 'resolved', resolvedAt: now });
        }
    }
    const findingIds: Array<Id<'commerceReconciliationFindings'>> = [];
    const addFinding = async (
        kind: 'missing_order' | 'missing_stripe_payment' | 'amount_mismatch' | 'currency_mismatch' | 'status_mismatch' | 'informational',
        severity: 'info' | 'warning' | 'critical',
        paymentIntentId: string | null,
        orderId: Id<'orders'> | null,
        summary: string,
        details: Record<string, unknown>,
    ) => {
        findingIds.push(
            await ctx.db.insert('commerceReconciliationFindings', {
                runId: run._id,
                kind,
                severity,
                paymentIntentId,
                orderId,
                summary,
                detailsJson: JSON.stringify(details),
                status: 'open',
                createdAt: now,
                resolvedAt: null,
            }),
        );
    };
    for (const payment of args.payments) {
        const order = ordersByPayment.get(payment.paymentIntentId);
        if (!order && payment.paid) {
            await addFinding('missing_order', 'critical', payment.paymentIntentId, null, 'Stripe payment has no matching studio order', {
                amountCents: payment.amountCents,
                currency: payment.currency,
            });
            continue;
        }
        if (!order) continue;
        if ((order.amountPaidCents ?? 0) !== payment.amountCents) {
            await addFinding('amount_mismatch', 'critical', payment.paymentIntentId, order._id, 'Order total does not match Stripe', {
                canonicalCents: order.amountPaidCents,
                stripeCents: payment.amountCents,
            });
        }
        if (order.currency !== payment.currency) {
            await addFinding('currency_mismatch', 'critical', payment.paymentIntentId, order._id, 'Order currency does not match Stripe', {
                canonicalCurrency: order.currency,
                stripeCurrency: payment.currency,
            });
        }
        if (payment.refundedCents !== (order.refundedCents ?? 0)) {
            await addFinding('status_mismatch', 'warning', payment.paymentIntentId, order._id, 'Refund state needs review', {
                canonicalRefundedCents: order.refundedCents ?? 0,
                stripeRefundedCents: payment.refundedCents,
            });
        }
    }
    for (const order of orders) {
        if (order.paymentIntentId && !paymentsById.has(order.paymentIntentId)) {
            await addFinding(
                'missing_stripe_payment',
                'critical',
                order.paymentIntentId,
                order._id,
                'Studio order has no matching Stripe payment in this period',
                { amountCents: order.amountPaidCents, currency: order.currency },
            );
        }
    }
    const feeCents = sum(args.payments.map((item) => item.feeCents));
    const netCents = sum(args.payments.map((item) => item.netCents));
    await ctx.db.patch(run._id, {
        status: 'completed',
        stripePaymentCount: args.payments.length,
        canonicalOrderCount: orders.length,
        findingCount: findingIds.length,
        feeCents,
        netCents,
        lastError: null,
        completedAt: now,
    });
    return { findings: findingIds.length };
}

export const completeReconciliation = mutation({
    args: { runId: v.id('commerceReconciliationRuns'), payments: v.array(paymentSnapshot) },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        return finishRun(ctx, args);
    },
});

export const completeReconciliationFromServer = mutation({
    args: { serverSecret: v.string(), runId: v.id('commerceReconciliationRuns'), payments: v.array(paymentSnapshot) },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        return finishRun(ctx, args);
    },
});

export const failReconciliation = mutation({
    args: { runId: v.id('commerceReconciliationRuns'), error: v.string() },
    handler: async (ctx, args) => {
        await requireOwnerIdentity(ctx);
        const run = await ctx.db.get(args.runId);
        if (!run) throw new Error('Reconciliation run not found.');
        await ctx.db.patch(run._id, {
            status: 'failed',
            lastError: args.error.slice(0, 1000),
            completedAt: Date.now(),
        });
        return { success: true };
    },
});

export const failReconciliationFromServer = mutation({
    args: { serverSecret: v.string(), runId: v.id('commerceReconciliationRuns'), error: v.string() },
    handler: async (ctx, args) => {
        requireServerSecret(args.serverSecret);
        const run = await ctx.db.get(args.runId);
        if (!run) throw new Error('Reconciliation run not found.');
        await ctx.db.patch(run._id, {
            status: 'failed',
            lastError: args.error.slice(0, 1000),
            completedAt: Date.now(),
        });
        return { success: true };
    },
});

export const resolveFinding = mutation({
    args: {
        findingId: v.id('commerceReconciliationFindings'),
        resolution: v.union(v.literal('resolved'), v.literal('ignored')),
    },
    handler: async (ctx, args) => {
        const identity = await requireOwnerIdentity(ctx);
        const finding = await ctx.db.get(args.findingId);
        if (!finding) throw new Error('Reconciliation finding not found.');
        const now = Date.now();
        await ctx.db.patch(finding._id, { status: args.resolution, resolvedAt: now });
        await ctx.db.insert('ownerAuditEvents', {
            actorId: String(identity.subject),
            action: `commerce.finding_${args.resolution}`,
            entityType: 'commerceReconciliationFindings',
            entityId: String(finding._id),
            detailsJson: '{}',
            createdAt: now,
        });
        return { success: true };
    },
});
