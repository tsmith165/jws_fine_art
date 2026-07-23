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

function checkoutErrorMessage(error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('not currently available')) return 'This artwork is no longer available for purchase.';
    if (message.includes('already in progress'))
        return 'This artwork is temporarily reserved in another checkout. Please try again shortly.';
    if (message.includes('studio shipping quote')) return 'Please contact the studio for a delivery quote for this artwork.';
    return 'Checkout could not be started. Please try again or contact the studio.';
}

export async function runStripePurchase(data: FormData) {
    let intent: {
        intentId: Id<'checkoutIntents'>;
        artworkTitle: string;
        imageUrl: string | null;
        artworkPriceCents: number;
        shippingCents: number;
        currency: string;
        deliveryMethod: 'domestic_shipping' | 'local_pickup' | 'international_quote';
        shippingTier: 'Small' | 'Medium' | 'Large' | 'Studio quote' | 'Local pickup';
        shippingPolicyVersion: string;
        shippingDescription: string;
    } | null = null;
    let session: Stripe.Checkout.Session | null = null;
    const { client, serverSecret } = getServerConvexClient();
    try {
        const stripe = stripeClient();
        const artworkLegacyId = Number(requiredFormValue(data, 'piece_id'));
        if (!Number.isSafeInteger(artworkLegacyId) || artworkLegacyId <= 0) throw new Error('Artwork ID is invalid.');
        const buyerName = requiredFormValue(data, 'full_name');
        const buyerPhone = requiredFormValue(data, 'phone');
        const buyerEmail = requiredFormValue(data, 'email');
        const destination = requiredFormValue(data, 'shipping_destination');
        if (destination !== 'domestic' && destination !== 'pickup' && destination !== 'international') {
            throw new Error('Shipping destination is invalid.');
        }
        const cancelToken = crypto.randomUUID();
        intent = await client.mutation(api.commerce.createCheckoutIntent, {
            serverSecret,
            artworkLegacyId,
            buyerName,
            buyerEmail,
            buyerPhone,
            destination: destination as ShippingDestination,
            cancelToken,
        });
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
                        name: 'Insured packing & U.S. shipping',
                        description: intent.shippingDescription,
                    },
                },
                quantity: 1,
            });
        }
        const metadata = {
            checkout_intent_id: String(intent.intentId),
            artwork_id: String(artworkLegacyId),
            delivery_method: intent.deliveryMethod,
            shipping_tier: intent.shippingTier,
            shipping_policy_version: intent.shippingPolicyVersion,
            shipping_cents: String(intent.shippingCents),
        };
        session = await stripe.checkout.sessions.create(
            {
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                customer_email: buyerEmail,
                client_reference_id: String(intent.intentId),
                expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
                success_url: `${origin}/checkout/success/${artworkLegacyId}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${origin}/checkout/cancel/${artworkLegacyId}?intent_id=${intent.intentId}&cancel_token=${encodeURIComponent(cancelToken)}`,
                ...(destination === 'domestic' ? { shipping_address_collection: { allowed_countries: ['US' as const] } } : {}),
                metadata,
                payment_intent_data: {
                    metadata,
                },
            },
            {
                idempotencyKey: `checkout-intent:${intent.intentId}`,
            },
        );
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : (session.payment_intent?.id ?? null);
        await client.mutation(api.commerce.attachCheckoutSession, {
            serverSecret,
            checkoutIntentId: intent.intentId,
            sessionId: session.id,
            paymentIntentId,
        });
        if (!session.url) throw new Error('Stripe did not return a checkout URL.');
        return { success: true as const, redirectUrl: session.url };
    } catch (error) {
        if (session?.id) {
            try {
                await stripeClient().checkout.sessions.expire(session.id);
            } catch (expirationError) {
                console.error('Unable to expire the unattached Stripe checkout session.', expirationError);
            }
        }
        if (intent && 'intentId' in intent) {
            try {
                await client.mutation(api.commerce.abandonCheckoutIntent, {
                    serverSecret,
                    checkoutIntentId: intent.intentId as Id<'checkoutIntents'>,
                });
            } catch (abandonError) {
                console.error('Unable to release the failed checkout reservation.', abandonError);
            }
        }
        console.error('Unable to create checkout session.', error);
        return { success: false as const, error: checkoutErrorMessage(error) };
    }
}
