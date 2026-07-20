'use client';

import { useMemo, useState } from 'react';
import { estimateArtworkShipping, type ShippingCare } from '@/lib/shipping';

export function ShippingEstimator() {
    const [width, setWidth] = useState('12');
    const [height, setHeight] = useState('9');
    const [framed, setFramed] = useState(false);
    const [care, setCare] = useState<ShippingCare>('standard');
    const estimate = useMemo(
        () =>
            estimateArtworkShipping({
                width: Number(width),
                height: Number(height),
                framed,
                care,
            }),
        [care, framed, height, width],
    );

    return (
        <div className="lw-shipping-estimator">
            <div className="lw-shipping-fields">
                <label>
                    Artwork width
                    <span>
                        <input
                            min="1"
                            max="120"
                            inputMode="decimal"
                            type="number"
                            value={width}
                            onChange={(e) => setWidth(e.target.value)}
                        />
                        <small>inches</small>
                    </span>
                </label>
                <label>
                    Artwork height
                    <span>
                        <input
                            min="1"
                            max="120"
                            inputMode="decimal"
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                        />
                        <small>inches</small>
                    </span>
                </label>
                <label>
                    Handling
                    <select value={care} onChange={(e) => setCare(e.target.value as ShippingCare)}>
                        <option value="standard">Standard artwork</option>
                        <option value="delicate">Delicate surface or glazing</option>
                    </select>
                </label>
                <label className="lw-shipping-check">
                    <input type="checkbox" checked={framed} onChange={(e) => setFramed(e.target.checked)} />
                    <span>Framed</span>
                </label>
            </div>
            <div className="lw-shipping-result" aria-live="polite">
                <span className="lw-eyebrow">Planning estimate</span>
                <h3>{estimate.classification}</h3>
                <strong>{estimate.estimatedCarrierRange}</strong>
                <p>{estimate.explanation}</p>
                <small>
                    This estimates the carrier and packing range, not the amount charged at checkout. Jill confirms special delivery needs
                    directly.
                </small>
            </div>
        </div>
    );
}
