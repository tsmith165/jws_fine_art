'use client';

import { Check, Globe2, LoaderCircle, MapPin, PackageCheck, Store } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { estimateArtworkShipping, SHIPPING_TIER_PRICES, type ShippingDestination, type ShippingEstimate } from '@/lib/shipping';
import { money } from '@/lib/artwork';

type PublicShippingTier = keyof typeof SHIPPING_TIER_PRICES;

type ShippingFormState = {
    tier: PublicShippingTier;
    framed: boolean;
    destination: ShippingDestination;
};

const tierDimensions: Record<PublicShippingTier, { width: number; height: number }> = {
    Small: { width: 8, height: 10 },
    Medium: { width: 16, height: 20 },
    Large: { width: 24, height: 30 },
};

const initialForm: ShippingFormState = {
    tier: 'Small',
    framed: false,
    destination: 'domestic',
};

function estimateForm(form: ShippingFormState): ShippingEstimate {
    const dimensions = tierDimensions[form.tier];
    return estimateArtworkShipping({
        ...dimensions,
        framed: form.framed,
        care: 'standard',
        destination: form.destination,
    });
}

export function ShippingEstimator() {
    const [form, setForm] = useState(initialForm);
    const [estimate, setEstimate] = useState(() => estimateForm(initialForm));
    const [isCalculating, setIsCalculating] = useState(false);
    const formRef = useRef(initialForm);
    const calculationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (calculationTimer.current) clearTimeout(calculationTimer.current);
        },
        [],
    );

    function updateForm(patch: Partial<ShippingFormState>) {
        const nextForm = { ...formRef.current, ...patch };
        formRef.current = nextForm;
        setForm(nextForm);
        setIsCalculating(true);
        if (calculationTimer.current) clearTimeout(calculationTimer.current);
        calculationTimer.current = setTimeout(() => {
            setEstimate(estimateForm(nextForm));
            setIsCalculating(false);
        }, 220);
    }

    const sizeItem = estimate.breakdown[0];

    return (
        <div className="lw-shipping-estimator">
            <div className="lw-shipping-fields">
                <header>
                    <span className="lw-eyebrow">Build an estimate</span>
                    <h2>Choose the size that will travel.</h2>
                    <p>Pick the closest size tier and whether the work is framed. Checkout uses the exact artwork record automatically.</p>
                </header>

                <fieldset>
                    <legend>
                        <span>01</span> Artwork size
                    </legend>
                    <div className="lw-shipping-tier-options">
                        {(Object.keys(SHIPPING_TIER_PRICES) as PublicShippingTier[]).map((tier) => (
                            <button type="button" key={tier} aria-pressed={form.tier === tier} onClick={() => updateForm({ tier })}>
                                <span>
                                    <strong>{tier}</strong>
                                    <small>{SHIPPING_TIER_PRICES[tier].example}</small>
                                </span>
                                <Check size={15} />
                            </button>
                        ))}
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <span>02</span> Delivery method
                    </legend>
                    <div className="lw-shipping-route lw-shipping-route-three">
                        <button
                            type="button"
                            aria-pressed={form.destination === 'domestic'}
                            onClick={() => updateForm({ destination: 'domestic' })}
                        >
                            <MapPin size={18} />
                            <span>
                                <strong>U.S. shipping</strong>
                                <small>Tracked and insured</small>
                            </span>
                            <Check className="lw-shipping-choice-check" size={15} />
                        </button>
                        <button
                            type="button"
                            aria-pressed={form.destination === 'pickup'}
                            onClick={() => updateForm({ destination: 'pickup' })}
                        >
                            <Store size={18} />
                            <span>
                                <strong>Local pickup</strong>
                                <small>San Diego County · free</small>
                            </span>
                            <Check className="lw-shipping-choice-check" size={15} />
                        </button>
                        <button
                            type="button"
                            aria-pressed={form.destination === 'international'}
                            onClick={() => updateForm({ destination: 'international' })}
                        >
                            <Globe2 size={18} />
                            <span>
                                <strong>International</strong>
                                <small>Studio quote</small>
                            </span>
                            <Check className="lw-shipping-choice-check" size={15} />
                        </button>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <span>03</span> Framing
                    </legend>
                    <label className="lw-shipping-check lw-shipping-check-full">
                        <input type="checkbox" checked={form.framed} onChange={(event) => updateForm({ framed: event.target.checked })} />
                        <span className="lw-shipping-check-box">
                            <Check size={14} />
                        </span>
                        <span>
                            <strong>Framed artwork</strong>
                            <small>Use the fixed tier price with frame protection included</small>
                        </span>
                    </label>
                </fieldset>
            </div>

            <div className={isCalculating ? 'lw-shipping-result is-calculating' : 'lw-shipping-result'} aria-busy={isCalculating}>
                <header>
                    <span className="lw-shipping-result-label">
                        <PackageCheck size={16} />
                        <span className="lw-eyebrow">Planning estimate</span>
                    </span>
                    <span className="lw-shipping-status" role="status" aria-live="polite">
                        {isCalculating ? (
                            <>
                                <LoaderCircle className="lw-spin" size={14} /> Recalculating
                            </>
                        ) : (
                            <>
                                <Check size={14} /> Estimate ready
                            </>
                        )}
                    </span>
                </header>
                <div className="lw-shipping-result-summary">
                    <div>
                        <h3>{estimate.classification}</h3>
                        <strong>{estimate.estimatedCarrierRange}</strong>
                    </div>
                </div>
                <p className="lw-shipping-basis">{estimate.basis}</p>
                <p className="lw-shipping-explanation">{estimate.explanation}</p>
                <dl className="lw-shipping-breakdown" aria-label="Shipping estimate breakdown">
                    <div>
                        <dt>
                            {sizeItem?.label ?? 'Delivery review'}
                            <small>{sizeItem?.detail ?? 'Jill will confirm the route and packing requirements directly'}</small>
                        </dt>
                        <dd>{sizeItem?.amount ?? 'Quoted'}</dd>
                    </div>
                    <div>
                        <dt>
                            Frame protection
                            <small>{form.framed ? 'Included in the framed tier price' : 'Unframed tier selected'}</small>
                        </dt>
                        <dd>{form.framed ? 'Included' : 'Not needed'}</dd>
                    </div>
                </dl>
                <div className="lw-shipping-checkout-contribution">
                    <span>{estimate.checkoutChargeCents === null ? 'Checkout availability' : 'Fixed checkout shipping'}</span>
                    <strong>
                        {estimate.checkoutChargeCents === null ? 'Studio quote required' : money(estimate.checkoutChargeCents / 100)}
                    </strong>
                    <small>
                        {estimate.checkoutChargeCents === null
                            ? 'Contact Jill to confirm international or custom delivery before payment.'
                            : estimate.checkoutChargeCents === 0
                              ? 'Local pickup adds no delivery charge.'
                              : 'This exact amount is added during checkout.'}
                    </small>
                </div>
                <p className="lw-shipping-disclaimer">
                    Sales tax is included where applicable. International shipping is arranged directly with the studio.
                </p>
            </div>
        </div>
    );
}
