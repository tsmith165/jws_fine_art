import 'server-only';
import Stripe from 'stripe';
import { assertStripeEnvironment } from '@/lib/providerSafety';

export type StripePaymentSnapshot = {
    paymentIntentId: string;
    amountCents: number;
    refundedCents: number;
    currency: string;
    paid: boolean;
    feeCents: number | null;
    netCents: number | null;
};

export function stripeReconciliationLivemode() {
    return assertStripeEnvironment().mode === 'live';
}

export async function collectStripePaymentSnapshots(
    windowStart: number,
    windowEnd: number,
): Promise<{
    livemode: boolean;
    payments: StripePaymentSnapshot[];
}> {
    const environment = assertStripeEnvironment();
    const stripe = new Stripe(environment.secretKey, { apiVersion: '2026-06-24.dahlia' });
    const payments = new Map<string, StripePaymentSnapshot>();
    for await (const charge of stripe.charges.list({
        created: { gte: Math.floor(windowStart / 1000), lte: Math.floor(windowEnd / 1000) },
        expand: ['data.balance_transaction'],
        limit: 100,
    })) {
        const paymentIntent = typeof charge.payment_intent === 'string' ? charge.payment_intent : (charge.payment_intent?.id ?? null);
        if (!paymentIntent) continue;
        const balance = typeof charge.balance_transaction === 'string' ? null : charge.balance_transaction;
        payments.set(paymentIntent, {
            paymentIntentId: paymentIntent,
            amountCents: charge.amount,
            refundedCents: charge.amount_refunded,
            currency: charge.currency,
            paid: charge.paid,
            feeCents: balance?.fee ?? null,
            netCents: balance?.net ?? null,
        });
    }
    return { livemode: environment.mode === 'live', payments: [...payments.values()] };
}
