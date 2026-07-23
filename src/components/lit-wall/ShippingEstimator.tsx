'use client';

import { Check, Globe2, LoaderCircle, MapPin, PackageCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { estimateArtworkShipping, type ShippingCare, type ShippingDestination, type ShippingEstimate } from '@/lib/shipping';

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

            <div className={`lw-shipping-result${isCalculating ? 'is-calculating' : ''}`} aria-busy={isCalculating}>
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
                {estimate.breakdown.length > 0 && (
                    <dl className="lw-shipping-breakdown">
                        {estimate.breakdown.map((item) => (
                            <div key={item.label}>
                                <dt>
                                    {item.label}
                                    <small>{item.detail}</small>
                                </dt>
                                <dd>{item.amount}</dd>
                            </div>
                        ))}
                    </dl>
                )}
                <p className="lw-shipping-disclaimer">
                    Planning range only. Final packing, insured carrier cost, and checkout contribution are confirmed separately. Import
                    duties, taxes, and brokerage are not included.
                </p>
            </div>
        </div>
    );
}
