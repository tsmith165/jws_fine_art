'use client';

import { Check, CreditCard, Globe2, LoaderCircle, LockKeyhole, MapPin, PackageCheck, ShieldCheck } from 'lucide-react';
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
        }, 450);
    }

    const shippingDollars = (shipping.checkoutChargeCents ?? 0) / 100;
    const total = current_piece.price + shippingDollars;
    const canCheckout = shipping.checkoutChargeCents !== null && !shipping.requiresQuote;
    const checkoutBreakdown = new Map(shipping.checkoutBreakdown.map((item) => [item.label, item]));
    const sizeItem = shipping.checkoutBreakdown[0];
    const framedItem = checkoutBreakdown.get('Framed-work protection');
    const delicateItem = checkoutBreakdown.get('Delicate-surface handling');
    const internationalItem = checkoutBreakdown.get('International route');
    const factorRows = [
        {
            label: 'Size and delivery class',
            amount: sizeItem ? money(sizeItem.amountCents / 100) : 'Studio quote',
            detail: sizeItem?.detail ?? 'Packing and delivery will be reviewed by the studio',
            active: Boolean(sizeItem),
        },
        framedItem
            ? { ...framedItem, amount: money(framedItem.amountCents / 100), active: true }
            : {
                  label: 'Framed-work protection',
                  amount: 'Not added',
                  detail: shipping.requiresQuote ? 'Reviewed with the custom packing quote' : 'Unframed artwork',
                  active: false,
              },
        delicateItem
            ? { ...delicateItem, label: 'Delicate or glazed handling', amount: money(delicateItem.amountCents / 100), active: true }
            : {
                  label: 'Delicate or glazed handling',
                  amount: 'Not added',
                  detail: shipping.requiresQuote ? 'Reviewed with the custom packing quote' : 'Standard surface handling',
                  active: false,
              },
        internationalItem
            ? { ...internationalItem, amount: money(internationalItem.amountCents / 100), active: true }
            : {
                  label: 'International route',
                  amount: 'Not added',
                  detail: shipping.requiresQuote ? 'Reviewed with the custom delivery quote' : 'United States delivery',
                  active: false,
              },
    ];

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
                <div className="lw-checkout-route" role="group" aria-label="Shipping destination">
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
                        aria-pressed={destination === 'international'}
                        onClick={() => chooseDestination('international')}
                        disabled={pending}
                    >
                        <Globe2 size={18} />
                        <span>
                            <strong>International</strong>
                            <small>Outside the U.S.</small>
                        </span>
                        <Check size={15} />
                    </button>
                </div>
                <label>
                    Complete shipping address
                    <textarea
                        name="address"
                        required
                        autoComplete="street-address"
                        rows={4}
                        disabled={pending}
                        placeholder={
                            destination === 'international'
                                ? 'Street, city, region, postal code, and country'
                                : 'Street, city, state, and ZIP code'
                        }
                    />
                </label>
            </fieldset>

            <section
                className={['lw-checkout-shipping', isCalculating && 'is-calculating'].filter(Boolean).join(' ')}
                aria-busy={isCalculating}
            >
                <header>
                    <span>
                        <PackageCheck size={17} /> Insured packing & shipping
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
                {shipping.checkoutBreakdown.length > 0 ? (
                    <dl aria-label="Checkout shipping breakdown">
                        {factorRows.map((item) => (
                            <div className={item.active ? undefined : 'is-inactive'} key={item.label}>
                                <dt>
                                    {item.label}
                                    <small>{item.detail}</small>
                                </dt>
                                <dd>{item.amount}</dd>
                            </div>
                        ))}
                    </dl>
                ) : (
                    <p className="lw-checkout-quote-note">This artwork needs a custom packing or delivery review before payment.</p>
                )}
                <small className={destination === 'international' ? undefined : 'is-reserved'}>
                    Import duties, destination taxes, and brokerage are paid separately by the collector.
                </small>
            </section>

            <div className="lw-checkout-total" aria-label="Order total">
                <span>Artwork</span>
                <strong>{money(current_piece.price)}</strong>
                <span>Insured packing & shipping</span>
                <strong>{shipping.checkoutChargeCents === null ? 'Quoted separately' : money(shippingDollars)}</strong>
                <b>Total due on Stripe</b>
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
                        <LockKeyhole size={14} /> You will review this total before paying on Stripe. Card details never touch this site.
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
                    <ShieldCheck size={15} /> Tracked and insured
                </span>
                <span>
                    <PackageCheck size={15} /> Packed by Jill’s studio
                </span>
            </div>
        </form>
    );
}
