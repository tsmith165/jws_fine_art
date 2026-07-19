import React from 'react';
import { render } from '@react-email/render';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';
import { sendEmail } from '@/utils/emails/resend_utils';
import CheckoutSuccessEmail from '@/utils/emails/templates/checkoutSuccessEmail';
import { assertStripeEnvironment } from '@/lib/providerSafety';

function stripeClient() {
    return new Stripe(assertStripeEnvironment().secretKey, { apiVersion: '2026-06-24.dahlia' });
}

async function checkoutSessionId(stripe: Stripe, paymentIntentId: string) {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
    return sessions.data[0]?.id ?? null;
}

function stripeEventDetails(event: Stripe.Event) {
    const object = event.data.object;
    if (object.object === 'payment_intent') {
        return {
            paymentIntentId: object.id,
            amountCents: event.type === 'payment_intent.succeeded' ? object.amount_received : null,
            currency: object.currency,
        };
    }
    if (object.object === 'charge') {
        const paymentIntentId = typeof object.payment_intent === 'string' ? object.payment_intent : (object.payment_intent?.id ?? null);
        return {
            paymentIntentId,
            amountCents: event.type === 'charge.refunded' ? object.amount_refunded : object.amount,
            currency: object.currency,
        };
    }
    if (object.object === 'dispute') {
        const paymentIntent = object.payment_intent;
        return {
            paymentIntentId: typeof paymentIntent === 'string' ? paymentIntent : (paymentIntent?.id ?? null),
            amountCents: object.amount,
            currency: object.currency,
        };
    }
    return { paymentIntentId: null, amountCents: null, currency: null };
}

export async function POST(request: Request) {
    let stripe: Stripe;
    try {
        stripe = stripeClient();
    } catch (error) {
        console.error('Stripe environment validation failed.', error);
        return Response.json({ error: 'Webhook configuration is invalid.' }, { status: 503 });
    }
    const payload = await request.text();
    const signature = request.headers.get('stripe-signature');
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!signature || !webhookSecret) return Response.json({ error: 'Webhook configuration is incomplete.' }, { status: 400 });

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
        console.error('Stripe webhook signature verification failed.', error);
        return Response.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    try {
        const details = stripeEventDetails(event);
        const paymentIntentId = details.paymentIntentId;
        const sessionId = paymentIntentId ? await checkoutSessionId(stripe, paymentIntentId) : null;
        const { client, serverSecret } = getServerConvexClient();
        const result = await client.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: event.id,
            eventType: event.type,
            paymentIntentId,
            checkoutSessionId: sessionId,
            amountReceivedCents: details.amountCents,
            currency: details.currency,
        });

        if (result.outcome === 'processed' && 'notification' in result && result.notification && paymentIntentId) {
            const notification = result.notification;
            try {
                const emailHtml = await render(
                    React.createElement(CheckoutSuccessEmail, {
                        full_name: notification.buyerName,
                        piece_title: notification.artworkTitle,
                        address: notification.shippingAddress,
                        price_paid: notification.amountPaidCents / 100,
                    }),
                );
                await sendEmail({
                    from: 'contact@jwsfineart.com',
                    to: [notification.buyerEmail, 'jwsfineart@gmail.com'],
                    subject: 'Purchase Confirmation - JWS Fine Art Gallery',
                    html: emailHtml,
                });
                await client.mutation(api.commerce.recordNotificationOutcome, {
                    serverSecret,
                    paymentIntentId,
                    outcome: 'sent',
                    details: 'Purchase confirmation accepted by the email provider.',
                });
            } catch (error) {
                console.error('Purchase was recorded, but confirmation email failed.', error);
                await client.mutation(api.commerce.recordNotificationOutcome, {
                    serverSecret,
                    paymentIntentId,
                    outcome: 'failed',
                    details: 'Purchase confirmation delivery failed and needs owner attention.',
                });
            }
            revalidatePath('/');
            revalidatePath('/gallery');
            revalidatePath('/admin/orders');
        }
        return Response.json({ received: true, outcome: result.outcome });
    } catch (error) {
        console.error('Stripe webhook processing failed.', error);
        return Response.json({ error: 'Webhook processing failed.' }, { status: 500 });
    }
}
