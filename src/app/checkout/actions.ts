'use server';

import { headers } from 'next/headers';
import Stripe from 'stripe';
import { api } from '../../../convex/_generated/api';
import type { Id } from '../../../convex/_generated/dataModel';
import { getServerConvexClient } from '@/data/serverConvex';
import { assertStripeEnvironment } from '@/lib/providerSafety';
import type { ShippingDestination } from '@/lib/shipping';

function stripeClient() {
    return new Stripe(assertStripeEnvironment().secretKey, { apiVersion: '2026-06-24.dahlia' });
}

function siteOrigin(requestHeaders: Headers) {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (configured) return configured.startsWith('http') ? configured : `https://${configured}`;
    const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
    const protocol = requestHeaders.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https');
    if (!host) throw new Error('Unable to determine the site URL for checkout.');
    return `${protocol}://${host}`;
}

function requiredFormValue(data: FormData, key: string) {
    const value = data.get(key)?.toString().trim();
    if (!value) throw new Error(`${key.replaceAll('_', ' ')} is required.`);
    return value;
}

export async function runStripePurchase(data: FormData) {
    const stripe = stripeClient();
    const artworkLegacyId = Number(requiredFormValue(data, 'piece_id'));
    if (!Number.isSafeInteger(artworkLegacyId) || artworkLegacyId <= 0) throw new Error('Artwork ID is invalid.');
    const buyerName = requiredFormValue(data, 'full_name');
    const buyerPhone = requiredFormValue(data, 'phone');
    const buyerEmail = requiredFormValue(data, 'email');
    const shippingAddress = requiredFormValue(data, 'address');
    const destination = requiredFormValue(data, 'shipping_destination');
    if (destination !== 'domestic' && destination !== 'international') throw new Error('Shipping destination is invalid.');
    const { client, serverSecret } = getServerConvexClient();
    const intent = await client.mutation(api.commerce.createCheckoutIntent, {
        serverSecret,
        artworkLegacyId,
        buyerName,
        buyerEmail,
        buyerPhone,
        shippingAddress,
        destination: destination as ShippingDestination,
    });

    try {
        const origin = siteOrigin(await headers());
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price_data: {
                    currency: intent.currency,
                    unit_amount: intent.artworkPriceCents,
                    product_data: {
                        name: intent.artworkTitle,
                        ...(intent.imageUrl ? { images: [intent.imageUrl] } : {}),
                    },
                },
                quantity: 1,
            },
        ];
        if (intent.shippingCents > 0) {
            lineItems.push({
                price_data: {
                    currency: intent.currency,
                    unit_amount: intent.shippingCents,
                    product_data: {
                        name: intent.international ? 'Insured packing & international shipping' : 'Insured packing & U.S. shipping',
                        description: intent.shippingDescription,
                    },
                },
                quantity: 1,
            });
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: buyerEmail,
            client_reference_id: String(intent.intentId),
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
            success_url: `${origin}/checkout/success/${artworkLegacyId}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/checkout/cancel/${artworkLegacyId}`,
            payment_intent_data: {
                metadata: {
                    checkout_intent_id: String(intent.intentId),
                    artwork_id: String(artworkLegacyId),
                    shipping_destination: destination,
                    shipping_cents: String(intent.shippingCents),
                },
            },
        });
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null);
        await client.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: session.id,
            paymentIntentId,
        });
        if (!session.url) throw new Error('Stripe did not return a checkout URL.');
        return { success: true, redirectUrl: session.url };
    } catch (error) {
        await client.mutation(api.commerce.abandonCheckoutIntent, {
            serverSecret,
            checkoutIntentId: intent.intentId as Id<'checkoutIntents'>,
        });
        console.error('Unable to create checkout session.', error);
        throw new Error('Checkout could not be started. Please try again or contact the studio.');
    }
}
