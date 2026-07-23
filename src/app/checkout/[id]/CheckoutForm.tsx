'use client';

import { Check, CreditCard, Globe2, LoaderCircle, LockKeyhole, MapPin, PackageCheck, ShieldCheck, Store } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PiecesWithImages } from '@/types/artwork';
import { money } from '@/lib/artwork';
import { captureAnalytics } from '@/lib/analytics';
import { estimateArtworkShipping, shippingCareForMedium, type ShippingDestination } from '@/lib/shipping';
import { runStripePurchase } from '../actions';

function checkoutShipping(piece: PiecesWithImages, destination: ShippingDestination) {
    return estimateArtworkShipping({
        width: piece.real_width ?? 0,
        height: piece.real_height ?? 0,
        framed: Boolean(piece.framed),
        care: shippingCareForMedium(piece.piece_type),
        destination,
    });
}

export default function CheckoutForm({ current_piece }: { current_piece: PiecesWithImages }) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState('');
    const [destination, setDestination] = useState<ShippingDestination>('domestic');
    const [shipping, setShipping] = useState(() => checkoutShipping(current_piece, 'domestic'));
    const [isCalculating, setIsCalculating] = useState(false);
    const calculationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (calculationTimer.current) clearTimeout(calculationTimer.current);
        },
        [],
    );

    function chooseDestination(nextDestination: ShippingDestination) {
        if (nextDestination === destination || pending) return;
        setDestination(nextDestination);
        setIsCalculating(true);
        if (calculationTimer.current) clearTimeout(calculationTimer.current);
        calculationTimer.current = setTimeout(() => {
            setShipping(checkoutShipping(current_piece, nextDestination));
            setIsCalculating(false);
        }, 220);
    }

    const shippingDollars = (shipping.checkoutChargeCents ?? 0) / 100;
    const total = current_piece.price + shippingDollars;
    const canCheckout = shipping.checkoutChargeCents !== null && !shipping.requiresQuote;
    const pickup = destination === 'pickup';

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!canCheckout || isCalculating) return;
        captureAnalytics('checkout_payment_started', {
            artwork_id: current_piece.id,
            artwork_slug: current_piece.slug,
            source: 'checkout_form',
            destination,
            shipping_cents: shipping.checkoutChargeCents,
        });
        setPending(true);
        setError('');
        try {
            const result = await runStripePurchase(new FormData(event.currentTarget));
            if (!result.success) throw new Error(result.error);
            if (!result.redirectUrl) throw new Error('Checkout URL is missing.');
            window.location.assign(result.redirectUrl);
        } catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Checkout could not be started.');
            setPending(false);
        }
    }

    return (
        <form
            className={['lw-checkout-form', pending && 'is-pending'].filter(Boolean).join(' ')}
            onSubmit={submit}
            aria-busy={pending || isCalculating}
        >
            <input type="hidden" name="piece_id" value={current_piece.id} />
            <fieldset className="lw-checkout-step">
                <legend>
                    <span>01</span> Contact
                </legend>
                <div className="lw-field-row">
                    <label>
                        Full name
                        <input name="full_name" required autoComplete="name" disabled={pending} />
                    </label>
                    <label>
                        Email
                        <input name="email" type="email" required autoComplete="email" disabled={pending} />
                    </label>
                </div>
                <label>
                    Phone
                    <input name="phone" type="tel" required autoComplete="tel" disabled={pending} />
                </label>
            </fieldset>

            <fieldset className="lw-checkout-step">
                <legend>
                    <span>02</span> Delivery
                </legend>
                <input type="hidden" name="shipping_destination" value={destination} />
                <div className="lw-checkout-route lw-checkout-route-three" role="group" aria-label="Delivery method">
                    <button
                        type="button"
                        aria-pressed={destination === 'domestic'}
                        onClick={() => chooseDestination('domestic')}
                        disabled={pending}
                    >
                        <MapPin size={18} />
                        <span>
                            <strong>United States</strong>
                            <small>Insured domestic delivery</small>
                        </span>
                        <Check size={15} />
                    </button>
                    <button
                        type="button"
                        aria-pressed={destination === 'pickup'}
                        onClick={() => chooseDestination('pickup')}
                        disabled={pending}
                    >
                        <Store size={18} />
                        <span>
                            <strong>Local pickup</strong>
                            <small>San Diego County · Free</small>
                        </span>
                        <Check size={15} />
                    </button>
                    <button
                        type="button"
                        aria-pressed={destination === 'international'}
                        onClick={() => chooseDestination('international')}
                        disabled={pending}
                    >
                        <Globe2 size={18} />
                        <span>
                            <strong>International</strong>
                            <small>Studio-arranged quote</small>
                        </span>
                        <Check size={15} />
                    </button>
                </div>
                <p className="lw-checkout-delivery-note">
                    {destination === 'domestic'
                        ? 'Stripe will collect and validate the U.S. delivery address before payment.'
                        : destination === 'pickup'
                          ? 'Jill will contact you after purchase to arrange a pickup time. Exact studio details stay private.'
                          : 'International delivery is quoted directly so insurance, carrier, and destination requirements can be confirmed.'}
                </p>
            </fieldset>

            <section
                className={['lw-checkout-shipping', isCalculating && 'is-calculating'].filter(Boolean).join(' ')}
                aria-busy={isCalculating}
            >
                <header>
                    <span>
                        {pickup ? <Store size={17} /> : <PackageCheck size={17} />}
                        {pickup ? ' Local studio pickup' : ' Insured packing & shipping'}
                    </span>
                    <div>
                        <span className="lw-checkout-shipping-status" role="status" aria-live="polite">
                            {isCalculating ? (
                                <>
                                    <LoaderCircle className="lw-spin" size={12} /> Recalculating
                                </>
                            ) : (
                                <>
                                    <Check size={12} /> Estimate ready
                                </>
                            )}
                        </span>
                        <strong>{shipping.checkoutChargeCents === null ? 'Studio quote' : money(shippingDollars)}</strong>
                    </div>
                </header>
                <p className="lw-checkout-shipping-basis">{shipping.basis}</p>
                {!shipping.requiresQuote ? (
                    <dl aria-label="Checkout shipping breakdown">
                        <div>
                            <dt>
                                Delivery tier
                                <small>
                                    {pickup
                                        ? 'Pickup coordinated directly with the studio'
                                        : `${shipping.classification} · based on the artwork’s exact dimensions`}
                                </small>
                            </dt>
                            <dd>{pickup ? 'Pickup' : shipping.classification}</dd>
                        </div>
                        <div>
                            <dt>
                                Artwork protection
                                <small>
                                    {pickup
                                        ? 'No carrier packing charge'
                                        : current_piece.framed
                                          ? 'Tier price includes framed-work protection'
                                          : 'Insured tier price for unframed artwork'}
                                </small>
                            </dt>
                            <dd>{pickup ? 'Not shipped' : current_piece.framed ? 'Framed' : 'Unframed'}</dd>
                        </div>
                        <div>
                            <dt>
                                Delivery charge
                                <small>{pickup ? 'No pickup fee' : 'Fixed amount charged at checkout'}</small>
                            </dt>
                            <dd>{pickup ? 'Free' : money(shippingDollars)}</dd>
                        </div>
                    </dl>
                ) : (
                    <p className="lw-checkout-quote-note">
                        Jill will confirm an insured international delivery option and price before payment.
                    </p>
                )}
                <small>Sales tax is included where applicable. International duties and brokerage are quoted or paid separately.</small>
            </section>

            <div className="lw-checkout-total" aria-label="Order total">
                <span>Artwork</span>
                <strong>{money(current_piece.price)}</strong>
                <span>{pickup ? 'Local studio pickup' : 'Insured packing & shipping'}</span>
                <strong>{shipping.checkoutChargeCents === null ? 'Quoted separately' : money(shippingDollars)}</strong>
                <span>Sales tax</span>
                <strong>Included where applicable</strong>
                <b>Total due</b>
                <b>{canCheckout ? money(total) : money(current_piece.price)}</b>
            </div>

            {canCheckout ? (
                <>
                    <button className="lw-button lw-button-brass lw-wide-button lw-checkout-submit" disabled={pending || isCalculating}>
                        {pending || isCalculating ? <LoaderCircle className="lw-spin" size={17} /> : <CreditCard size={17} />}{' '}
                        {pending
                            ? 'Creating your secure checkout…'
                            : isCalculating
                              ? 'Updating delivery total…'
                              : `Continue to secure payment · ${money(total)}`}
                    </button>
                    <p className="lw-secure-note">
                        <LockKeyhole size={14} /> Checkout is secured with our payment partner Stripe. Card details are never touched on
                        this site.
                    </p>
                </>
            ) : (
                <Link className="lw-button lw-button-brass lw-wide-button" href={`/contact?artwork=${current_piece.id}&kind=availability`}>
                    Ask the studio for a shipping quote
                </Link>
            )}

            {error && (
                <p className="lw-form-message is-error" role="alert">
                    {error}
                </p>
            )}

            <div className="lw-checkout-assurances">
                <span>
                    {pickup ? <Store size={15} /> : <ShieldCheck size={15} />}
                    {pickup ? 'Pickup coordinated by Jill' : 'Tracked and insured'}
                </span>
                <span>
                    <PackageCheck size={15} /> Packed by Jill’s studio
                </span>
            </div>
        </form>
    );
}
