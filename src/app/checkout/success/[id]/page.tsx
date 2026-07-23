import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';
import { api } from '../../../../../convex/_generated/api';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { AnalyticsEventOnMount } from '@/components/lit-wall/AnalyticsEvent';
import { readPublicArtwork } from '@/data/artworkReads';
import { getServerConvexClient } from '@/data/serverConvex';
import { assertStripeEnvironment } from '@/lib/providerSafety';
import { ProcessingRefresh } from './ProcessingRefresh';

export const metadata: Metadata = { title: 'Purchase received', robots: { index: false, follow: false } };

async function verifyCheckout(sessionId: string, artworkLegacyId: number) {
    if (!sessionId.startsWith('cs_')) return { state: 'invalid' as const };
    try {
        const stripe = new Stripe(assertStripeEnvironment().secretKey, { apiVersion: '2026-06-24.dahlia' });
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const { client, serverSecret } = getServerConvexClient();
        const status = await client.query(api.commerce.checkoutStatus, { serverSecret, sessionId, artworkLegacyId });
        if (!status || session.client_reference_id !== status.intentId) return { state: 'invalid' as const };
        if (session.payment_status !== 'paid') return { state: 'unpaid' as const };
        return status.intentStatus === 'paid' && status.orderRecorded && status.orderStatus === 'paid'
            ? { state: 'confirmed' as const, deliveryMethod: status.deliveryMethod }
            : { state: 'processing' as const, deliveryMethod: status.deliveryMethod };
    } catch (error) {
        console.error('Unable to verify checkout completion.', error);
        return { state: 'unavailable' as const };
    }
}

export default async function SuccessPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ session_id?: string }>;
}) {
    const id = Number((await params).id);
    const piece = Number.isSafeInteger(id) ? await readPublicArtwork(id) : null;
    if (!piece) notFound();
    const verification = await verifyCheckout((await searchParams).session_id || '', id);
    const confirmed = verification.state === 'confirmed';
    const processing = verification.state === 'processing';
    const pickup = 'deliveryMethod' in verification && verification.deliveryMethod === 'local_pickup';
    return (
        <SiteShell>
            {processing ? <ProcessingRefresh /> : null}
            {confirmed ? (
                <AnalyticsEventOnMount
                    event="checkout_succeeded"
                    oncePerSession={`checkout-succeeded:${id}`}
                    properties={{ artwork_id: piece.id, artwork_slug: piece.slug }}
                />
            ) : null}
            <section className="lw-purchase-status">
                <div>
                    <Image
                        src={piece.image_path}
                        alt={piece.title}
                        width={piece.width || 1}
                        height={piece.height || 1}
                        sizes="(max-width: 760px) 92vw, 42vw"
                    />
                </div>
                <article>
                    {confirmed ? <CheckCircle2 size={36} /> : null}
                    <span className="lw-eyebrow">{confirmed ? 'Purchase received' : 'Checkout status'}</span>
                    <h1>
                        {confirmed
                            ? `Thank you for collecting ${piece.title}.`
                            : processing
                              ? 'Your payment is being recorded.'
                              : 'We could not confirm this purchase yet.'}
                    </h1>
                    <p>
                        {confirmed
                            ? pickup
                                ? 'A confirmation is on its way to your email. Jill will contact you to arrange a local pickup time.'
                                : 'A confirmation is on its way to your email. Jill will follow up with packing, tracking, and insured shipping details.'
                            : processing
                              ? 'Stripe has accepted the payment. This page will show a confirmation once the secure order record is complete.'
                              : 'No confirmed order was found for this link. Your Stripe receipt is the source of truth; contact Jill if a charge appears.'}
                    </p>
                    <p>
                        Questions? Email <a href="mailto:jwsfineart@gmail.com">jwsfineart@gmail.com</a>.
                    </p>
                    <Link className="lw-button lw-button-brass" href="/work">
                        Continue through the collection <ArrowRight size={16} />
                    </Link>
                </article>
            </section>
        </SiteShell>
    );
}

export const dynamic = 'force-dynamic';
