import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import Stripe from 'stripe';
import { api } from '../../../../../convex/_generated/api';
import type { Id } from '../../../../../convex/_generated/dataModel';
import { SiteShell } from '@/components/lit-wall/SiteShell';
import { AnalyticsEventOnMount } from '@/components/lit-wall/AnalyticsEvent';
import { readPublicArtwork } from '@/data/artworkReads';
import { getServerConvexClient } from '@/data/serverConvex';
import { artworkHref } from '@/lib/artwork';
import { assertStripeEnvironment } from '@/lib/providerSafety';

export const metadata: Metadata = { title: 'Checkout paused', robots: { index: false, follow: false } };

async function releaseCheckout(artworkLegacyId: number, checkoutIntentId: string, cancelToken: string) {
    if (!checkoutIntentId || !cancelToken) return false;
    const { client, serverSecret } = getServerConvexClient();
    try {
        const checkoutIntent = checkoutIntentId as Id<'checkoutIntents'>;
        const cancellation = await client.query(api.commerce.checkoutCancellation, {
            serverSecret,
            checkoutIntentId: checkoutIntent,
            cancelToken,
        });
        if (!cancellation || cancellation.artworkLegacyId !== artworkLegacyId) return false;
        if (cancellation.status === 'paid') return false;
        if (cancellation.sessionId && cancellation.status === 'checkout_open') {
            const stripe = new Stripe(assertStripeEnvironment().secretKey, { apiVersion: '2026-06-24.dahlia' });
            const session = await stripe.checkout.sessions.retrieve(cancellation.sessionId);
            if (session.status === 'open') await stripe.checkout.sessions.expire(session.id);
        }
        await client.mutation(api.commerce.abandonCheckoutIntent, {
            serverSecret,
            checkoutIntentId: checkoutIntent,
            cancelToken,
        });
        return true;
    } catch (error) {
        console.error('Unable to release the canceled checkout reservation.', error);
        return false;
    }
}

export default async function CancelPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ intent_id?: string; cancel_token?: string }>;
}) {
    const id = Number((await params).id);
    const piece = Number.isSafeInteger(id) ? await readPublicArtwork(id) : null;
    if (!piece) notFound();
    const query = await searchParams;
    const released = await releaseCheckout(id, query.intent_id ?? '', query.cancel_token ?? '');
    return (
        <SiteShell>
            <AnalyticsEventOnMount
                event="checkout_canceled"
                oncePerSession={`checkout-canceled:${id}`}
                properties={{ artwork_id: piece.id, artwork_slug: piece.slug }}
            />
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
                    <span className="lw-eyebrow">{released ? 'Reservation released' : 'Checkout paused'}</span>
                    <h1>{released ? `${piece.title} is available again.` : `${piece.title} is still on the wall.`}</h1>
                    <p>
                        No payment was taken.{' '}
                        {released
                            ? 'The checkout reservation has been released, so you can start again whenever you are ready.'
                            : 'You can return to the artwork whenever you are ready, or ask Jill a question first.'}
                    </p>
                    <Link className="lw-button lw-button-brass" href={artworkHref(piece)}>
                        <ArrowLeft size={16} /> Return to the artwork
                    </Link>
                    <Link className="lw-button lw-button-ghost" href={`/contact?artwork=${piece.id}`}>
                        Ask the studio
                    </Link>
                </article>
            </section>
        </SiteShell>
    );
}

export const dynamic = 'force-dynamic';
