import React from 'react';
import { render } from '@react-email/render';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { api } from '../../../../../convex/_generated/api';
import { getServerConvexClient } from '@/data/serverConvex';
import { sendEmail } from '@/utils/emails/resend_utils';
import CheckoutSuccessEmail from '@/utils/emails/templates/checkoutSuccessEmail';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-06-24.dahlia' });

async function checkoutSessionId(paymentIntentId: string) {
    const sessions = await stripe.checkout.sessions.list({ payment_intent: paymentIntentId, limit: 1 });
    return sessions.data[0]?.id ?? null;
}

export async function POST(request: Request) {
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
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentIntentId = paymentIntent.object === 'payment_intent' ? paymentIntent.id : null;
        const sessionId = paymentIntentId ? await checkoutSessionId(paymentIntentId) : null;
        const { client, serverSecret } = getServerConvexClient();
        const result = await client.mutation(api.commerce.processStripeEvent, {
            serverSecret,
            eventId: event.id,
            eventType: event.type,
            paymentIntentId,
            checkoutSessionId: sessionId,
            amountReceivedCents:
                event.type === 'payment_intent.succeeded' && paymentIntent.object === 'payment_intent'
                    ? paymentIntent.amount_received
                    : null,
            currency: paymentIntent.object === 'payment_intent' ? paymentIntent.currency : null,
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
