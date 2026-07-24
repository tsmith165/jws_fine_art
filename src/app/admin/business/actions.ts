'use server';

import { revalidatePath } from 'next/cache';
import type { Id } from '../../../../convex/_generated/dataModel';
import { api } from '../../../../convex/_generated/api';
import { getAuthenticatedOwnerConvexClient } from '@/data/ownerConvex';
import { collectStripePaymentSnapshots, stripeReconciliationLivemode } from '@/lib/stripeReconciliation';

function rangeWindow(rangeDays: number) {
    const end = Date.now();
    const days = Number.isFinite(rangeDays) && rangeDays > 0 ? Math.min(rangeDays, 3650) : 3650;
    return { start: end - days * 24 * 60 * 60 * 1000, end };
}

export async function runStripeReconciliation(rangeDays: number) {
    const client = await getAuthenticatedOwnerConvexClient('reconcile Stripe payments');
    const window = rangeWindow(rangeDays);
    const runId = await client.mutation(api.ownerBusiness.beginReconciliation, {
        livemode: stripeReconciliationLivemode(),
        stripeWindowStart: window.start,
        stripeWindowEnd: window.end,
    });
    try {
        const snapshots = await collectStripePaymentSnapshots(window.start, window.end);
        await client.mutation(api.ownerBusiness.completeReconciliation, { runId, payments: snapshots.payments });
    } catch (error) {
        await client.mutation(api.ownerBusiness.failReconciliation, {
            runId,
            error: error instanceof Error ? error.message : 'Unknown reconciliation error.',
        });
        throw error;
    }
    revalidatePath('/admin/business');
}

export async function retryStripeInbox(inboxId: Id<'stripeWebhookInbox'>) {
    const client = await getAuthenticatedOwnerConvexClient('retry a Stripe event');
    await client.mutation(api.ownerBusiness.retryStripeInbox, { inboxId });
    revalidatePath('/admin/business');
}

export async function retryConfirmation(outboxId: Id<'notificationOutbox'>) {
    const client = await getAuthenticatedOwnerConvexClient('retry a purchase confirmation');
    await client.mutation(api.ownerBusiness.retryConfirmation, { outboxId });
    revalidatePath('/admin/business');
}

export async function resolveQuarantine(formData: FormData) {
    const client = await getAuthenticatedOwnerConvexClient('resolve a Stripe quarantine');
    await client.mutation(api.ownerBusiness.resolveQuarantine, {
        quarantineId: String(formData.get('quarantineId')) as Id<'webhookQuarantine'>,
        resolution: String(formData.get('resolution')) === 'ignored' ? 'ignored' : 'resolved',
        note: String(formData.get('note') || ''),
    });
    revalidatePath('/admin/business');
}

export async function resolveFinding(formData: FormData) {
    const client = await getAuthenticatedOwnerConvexClient('resolve a reconciliation finding');
    await client.mutation(api.ownerBusiness.resolveFinding, {
        findingId: String(formData.get('findingId')) as Id<'commerceReconciliationFindings'>,
        resolution: String(formData.get('resolution')) === 'ignored' ? 'ignored' : 'resolved',
    });
    revalidatePath('/admin/business');
}
