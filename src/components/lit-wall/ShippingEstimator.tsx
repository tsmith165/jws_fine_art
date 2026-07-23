'use client';

import { Check, Globe2, LoaderCircle, MapPin, PackageCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { estimateArtworkShipping, type ShippingCare, type ShippingDestination, type ShippingEstimate } from '@/lib/shipping';
import { money } from '@/lib/artwork';

type ShippingFormState = {
    width: string;
    height: string;
    framed: boolean;
    care: ShippingCare;
    destination: ShippingDestination;
};

const initialForm: ShippingFormState = {
    width: '12',
    height: '9',
    framed: false,
    care: 'standard',
    destination: 'domestic',
};

function estimateForm(form: ShippingFormState): ShippingEstimate {
    return estimateArtworkShipping({
        width: Number(form.width),
        height: Number(form.height),
        framed: form.framed,
        care: form.care,
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
        }, 450);
    }

    const breakdownByLabel = new Map(estimate.breakdown.map((item) => [item.label, item]));
    const customOrSizeItem = breakdownByLabel.get('Size and delivery class') ??
        breakdownByLabel.get('Custom packing and delivery') ?? {
            label: 'Size and delivery class',
            amount: 'Pending',
            detail: 'Enter both dimensions to select a packing class',
        };
    const factorRows = [
        { ...customOrSizeItem, active: true },
        breakdownByLabel.get('Framed-work protection')
            ? { ...breakdownByLabel.get('Framed-work protection')!, active: true }
            : {
                  label: 'Framed-work protection',
                  amount: 'Not added',
                  detail: estimate.requiresQuote ? 'Reviewed with the custom packing quote' : 'Unframed artwork selected',
                  active: false,
              },
        breakdownByLabel.get('Delicate or glazed handling')
            ? { ...breakdownByLabel.get('Delicate or glazed handling')!, active: true }
            : {
                  label: 'Delicate or glazed handling',
                  amount: 'Not added',
                  detail: estimate.requiresQuote ? 'Reviewed with the custom packing quote' : 'Standard surface handling selected',
                  active: false,
              },
        breakdownByLabel.get('International route')
            ? { ...breakdownByLabel.get('International route')!, active: true }
            : {
                  label: 'International route',
                  amount: 'Not added',
                  detail: estimate.requiresQuote ? 'Reviewed with the custom delivery quote' : 'United States delivery selected',
                  active: false,
              },
    ];

    return (
        <div className="lw-shipping-estimator">
            <div className="lw-shipping-fields">
                <header>
                    <span className="lw-eyebrow">Build an estimate</span>
                    <h2>Tell us what will travel.</h2>
                    <p>Artwork size, route, framing, and surface protection each shape the planning range.</p>
                </header>

                <fieldset>
                    <legend>
                        <span>01</span> Artwork dimensions
                    </legend>
                    <div className="lw-shipping-dimensions">
                        <label htmlFor="shipping-width">
                            Width
                            <span className="lw-shipping-number">
                                <input
                                    id="shipping-width"
                                    min="1"
                                    max="120"
                                    inputMode="decimal"
                                    type="number"
                                    value={form.width}
                                    onChange={(event) => updateForm({ width: event.target.value })}
                                />
                                <small aria-hidden="true">in</small>
                            </span>
                        </label>
                        <label htmlFor="shipping-height">
                            Height
                            <span className="lw-shipping-number">
                                <input
                                    id="shipping-height"
                                    min="1"
                                    max="120"
                                    inputMode="decimal"
                                    type="number"
                                    value={form.height}
                                    onChange={(event) => updateForm({ height: event.target.value })}
                                />
                                <small aria-hidden="true">in</small>
                            </span>
                        </label>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <span>02</span> Destination
                    </legend>
                    <div className="lw-shipping-route">
                        <button
                            type="button"
                            aria-pressed={form.destination === 'domestic'}
                            onClick={() => updateForm({ destination: 'domestic' })}
                        >
                            <MapPin size={18} />
                            <span>
                                <strong>United States</strong>
                                <small>Domestic delivery</small>
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
                                <small>Outside the U.S.</small>
                            </span>
                            <Check className="lw-shipping-choice-check" size={15} />
                        </button>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <span>03</span> Protection needs
                    </legend>
                    <div className="lw-shipping-protection">
                        <label htmlFor="shipping-care">
                            Surface and glazing
                            <select
                                id="shipping-care"
                                value={form.care}
                                onChange={(event) => updateForm({ care: event.target.value as ShippingCare })}
                            >
                                <option value="standard">Standard artwork</option>
                                <option value="delicate">Delicate surface or glazing</option>
                            </select>
                        </label>
                        <label className="lw-shipping-check">
                            <input
                                type="checkbox"
                                checked={form.framed}
                                onChange={(event) => updateForm({ framed: event.target.checked })}
                            />
                            <span className="lw-shipping-check-box">
                                <Check size={14} />
                            </span>
                            <span>
                                <strong>Framed artwork</strong>
                                <small>Add edge and corner protection</small>
                            </span>
                        </label>
                    </div>
                </fieldset>
            </div>

            <div className={isCalculating ? 'lw-shipping-result is-calculating' : 'lw-shipping-result'} aria-busy={isCalculating}>
                <header>
                    <span className="lw-eyebrow">Planning estimate</span>
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
                    <PackageCheck size={22} />
                    <div>
                        <h3>{estimate.classification}</h3>
                        <strong>{estimate.estimatedCarrierRange}</strong>
                    </div>
                </div>
                <p className="lw-shipping-basis">{estimate.basis}</p>
                <p className="lw-shipping-explanation">{estimate.explanation}</p>
                <dl className="lw-shipping-breakdown" aria-label="Shipping estimate breakdown">
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
                <div className="lw-shipping-checkout-contribution">
                    <span>{estimate.checkoutChargeCents === null ? 'Checkout availability' : 'Checkout shipping contribution'}</span>
                    <strong>
                        {estimate.checkoutChargeCents === null ? 'Studio quote required' : money(estimate.checkoutChargeCents / 100)}
                    </strong>
                    <small>
                        {estimate.checkoutChargeCents === null
                            ? 'The studio confirms custom packing or delivery before payment.'
                            : 'This fixed amount is added to the artwork price during checkout.'}
                    </small>
                </div>
                <p className="lw-shipping-disclaimer">
                    The range helps with planning; checkout uses the fixed contribution shown above. Import duties, destination taxes, and
                    brokerage are not included.
                </p>
            </div>
        </div>
    );
}
