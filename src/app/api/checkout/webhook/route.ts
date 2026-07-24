import Stripe from 'stripe';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';
import { assertStripeEnvironment } from '@/lib/providerSafety';

function formatAddress(address: Stripe.Address | null | undefined) {
    if (!address) return null;
    const locality = [address.city, address.state, address.postal_code].filter(Boolean).join(', ');
    const formatted = [address.line1, address.line2, locality, address.country].filter(Boolean).join('\n');
    return formatted || null;
}

function stripeEventPayload(event: Stripe.Event) {
    const object = event.data.object;
    if (object.object === 'checkout.session') {
        const paymentIntent = object.payment_intent;
        const shippingDetails = object.collected_information?.shipping_details;
        return {
            eventId: event.id,
            eventType: event.type,
            paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id ?? null),
            checkoutSessionId: object.id,
            amountReceivedCents: object.amount_total,
            currency: object.currency,
            paymentStatus: object.payment_status,
            taxCents: object.total_details?.amount_tax ?? null,
            customerName: object.customer_details?.name ?? shippingDetails?.name ?? null,
            customerEmail: object.customer_details?.email ?? object.customer_email ?? null,
            customerPhone: object.customer_details?.phone ?? null,
            shippingAddress: formatAddress(shippingDetails?.address),
            disputeStatus: null,
        };
    }
    if (object.object === 'payment_intent') {
        const shippingDetails = object.shipping;
        return {
            eventId: event.id,
            eventType: event.type,
            paymentIntentId: object.id,
            checkoutSessionId: null,
            amountReceivedCents: event.type === 'payment_intent.succeeded' ? object.amount_received : null,
            currency: object.currency,
            paymentStatus: null,
            taxCents: null,
            customerName: shippingDetails?.name ?? null,
            customerEmail: null,
            customerPhone: null,
            shippingAddress: formatAddress(shippingDetails?.address),
            disputeStatus: null,
        };
    }
    if (object.object === 'charge') {
        const paymentIntent = object.payment_intent;
        return {
            eventId: event.id,
            eventType: event.type,
            paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id ?? null),
            checkoutSessionId: null,
            amountReceivedCents: event.type === 'charge.refunded' ? object.amount_refunded : object.amount,
            currency: object.currency,
            paymentStatus: null,
            taxCents: null,
            customerName: null,
            customerEmail: null,
            customerPhone: null,
            shippingAddress: null,
            disputeStatus: null,
        };
    }
    if (object.object === 'dispute') {
        const paymentIntent = object.payment_intent;
        return {
            eventId: event.id,
            eventType: event.type,
            paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id ?? null),
            checkoutSessionId: null,
            amountReceivedCents: object.amount,
            currency: object.currency,
            paymentStatus: null,
            taxCents: null,
            customerName: null,
            customerEmail: null,
            customerPhone: null,
            shippingAddress: null,
            disputeStatus: object.status,
        };
    }
    return {
        eventId: event.id,
        eventType: event.type,
        paymentIntentId: null,
        checkoutSessionId: null,
        amountReceivedCents: null,
        currency: null,
        paymentStatus: null,
        taxCents: null,
        customerName: null,
        customerEmail: null,
        customerPhone: null,
        shippingAddress: null,
        disputeStatus: null,
    };
}

export async function POST(request: Request) {
    let environment: ReturnType<typeof assertStripeEnvironment>;
    try {
        environment = assertStripeEnvironment();
    } catch (error) {
        console.error('Stripe environment validation failed.', error);
        return Response.json({ error: 'Webhook configuration is invalid.' }, { status: 503 });
    }

    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) {
        return Response.json({ error: 'Webhook configuration is incomplete.' }, { status: 503 });
    }

    let event: Stripe.Event;
    try {
        const stripe = new Stripe(environment.secretKey, { apiVersion: '2026-06-24.dahlia' });
        event = stripe.webhooks.constructEvent(await request.text(), signature, webhookSecret);
    } catch (error) {
        console.error('Stripe webhook signature verification failed.', error);
        return Response.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    if (event.livemode !== (environment.mode === 'live')) {
        console.error('Stripe webhook mode did not match the configured credentials.', {
            eventId: event.id,
            eventLivemode: event.livemode,
            configuredMode: environment.mode,
        });
        return Response.json({ error: 'Webhook mode mismatch.' }, { status: 400 });
    }

    try {
        const { client, serverSecret } = getServerConvexClient();
        const result = await client.mutation(api.commerceWorkers.enqueueStripeEvent, {
            serverSecret,
            eventId: event.id,
            eventType: event.type,
            livemode: event.livemode,
            payloadJson: JSON.stringify(stripeEventPayload(event)),
        });
        return Response.json({ received: true, outcome: result.outcome });
    } catch (error) {
        console.error('Stripe webhook could not be durably queued.', error);
        return Response.json({ error: 'Webhook intake failed.' }, { status: 503 });
    }
}
