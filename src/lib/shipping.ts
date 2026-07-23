export type ShippingCare = 'standard' | 'delicate';
export type ShippingDestination = 'domestic' | 'international';

export type ShippingEstimate = {
    classification: 'Compact' | 'Standard' | 'Oversize' | 'Studio quote';
    estimatedCarrierRange: string;
    explanation: string;
    requiresQuote: boolean;
    basis: string;
    breakdown: Array<{
        label: string;
        amount: string;
        detail: string;
    }>;
};

export function estimateArtworkShipping({
    width,
    height,
    framed,
    care,
    destination = 'domestic',
}: {
    width: number;
    height: number;
    framed: boolean;
    care: ShippingCare;
    destination?: ShippingDestination;
}): ShippingEstimate {
    const longestSide = Math.max(width, height);
    const shortestSide = Math.min(width, height);

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return {
            classification: 'Studio quote',
            estimatedCarrierRange: 'Enter dimensions',
            explanation: 'Enter both artwork dimensions to receive a planning estimate.',
            requiresQuote: true,
            basis: destination === 'international' ? 'International delivery' : 'U.S. delivery',
            breakdown: [],
        };
    }

    const tier =
        longestSide <= 18 && shortestSide <= 14
            ? {
                  classification: 'Compact' as const,
                  low: 35,
                  high: 75,
                  explanation: 'Suitable for a compact, insured art package with protective clearance around the work.',
                  detail: 'Compact packing and insured carrier baseline',
                  requiresQuote: false,
              }
            : longestSide <= 34 && shortestSide <= 26
              ? {
                    classification: 'Standard' as const,
                    low: 75,
                    high: 150,
                    explanation: 'A double-boxed shipment with corner protection and room around the artwork.',
                    detail: 'Standard double-boxing and insured carrier baseline',
                    requiresQuote: false,
                }
              : longestSide <= 48 && shortestSide <= 36
                ? {
                      classification: 'Oversize' as const,
                      low: 150,
                      high: 300,
                      explanation: 'An oversize package with added packing material and likely carrier handling.',
                      detail: 'Oversize packing and insured carrier baseline',
                      requiresQuote: true,
                  }
                : null;

    const basis = `${width} × ${height} in · ${destination === 'international' ? 'International delivery' : 'U.S. delivery'}`;

    if (!tier) {
        return {
            classification: 'Studio quote',
            estimatedCarrierRange: 'Custom quote required',
            explanation: 'This size may require a custom crate, art handler, freight service, or local delivery arrangement.',
            requiresQuote: true,
            basis,
            breakdown: [
                {
                    label: 'Custom packing and delivery',
                    amount: 'Quoted',
                    detail: 'The packed depth, weight, value, and destination must be reviewed by the studio',
                },
            ],
        };
    }

    let low = tier.low;
    let high = tier.high;
    const breakdown: ShippingEstimate['breakdown'] = [
        {
            label: 'Size and delivery class',
            amount: `$${tier.low}–$${tier.high}`,
            detail: tier.detail,
        },
    ];

    if (framed) {
        low += 20;
        high += 45;
        breakdown.push({
            label: 'Framed-work protection',
            amount: '+$20–$45',
            detail: 'Additional edge, corner, and face clearance',
        });
    }

    if (care === 'delicate') {
        low += 35;
        high += 70;
        breakdown.push({
            label: 'Delicate or glazed handling',
            amount: '+$35–$70',
            detail: 'Extra surface isolation and impact protection',
        });
    }

    if (destination === 'international') {
        const internationalAdjustment =
            tier.classification === 'Compact'
                ? { low: 95, high: 190 }
                : tier.classification === 'Standard'
                  ? { low: 160, high: 320 }
                  : { low: 300, high: 600 };
        low += internationalAdjustment.low;
        high += internationalAdjustment.high;
        breakdown.push({
            label: 'International route',
            amount: `+$${internationalAdjustment.low}–$${internationalAdjustment.high}`,
            detail: 'Cross-border carrier range and export handling; duties and taxes are separate',
        });
    }

    return {
        classification: tier.classification,
        estimatedCarrierRange: `$${low}–$${high}`,
        explanation:
            destination === 'international'
                ? `${tier.explanation} The route range includes added international handling but not destination duties or taxes.`
                : tier.explanation,
        requiresQuote: tier.requiresQuote || destination === 'international',
        basis,
        breakdown,
    };
}
