export type ShippingCare = 'standard' | 'delicate';
export type ShippingDestination = 'domestic' | 'pickup' | 'international';
export type ShippingTier = 'Small' | 'Medium' | 'Large' | 'Studio quote' | 'Local pickup';

export const SHIPPING_POLICY_VERSION = '2026-07-23';

export const SHIPPING_TIER_PRICES = {
    Small: { unframed: 2500, framed: 4500, example: 'Up to 10 × 10 in' },
    Medium: { unframed: 5000, framed: 7500, example: 'Up to 16 × 20 in' },
    Large: { unframed: 10000, framed: 13000, example: 'Up to 24 × 30 in' },
} as const;

export type ShippingEstimate = {
    classification: ShippingTier;
    estimatedCarrierRange: string;
    explanation: string;
    requiresQuote: boolean;
    checkoutChargeCents: number | null;
    basis: string;
    breakdown: Array<{
        label: string;
        amount: string;
        detail: string;
    }>;
    checkoutBreakdown: Array<{
        label: string;
        amountCents: number;
        detail: string;
    }>;
};

export function shippingCareForMedium(medium: string | null | undefined): ShippingCare {
    return /(pastel|paper|intaglio|lino(?:cut| cut))/i.test(medium ?? '') ? 'delicate' : 'standard';
}

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
    void care;
    const longestSide = Math.max(width, height);
    const shortestSide = Math.min(width, height);

    if (destination === 'pickup') {
        return {
            classification: 'Local pickup',
            estimatedCarrierRange: 'Free',
            explanation: 'Pick up the artwork from Jill’s studio in San Diego County. Exact pickup details are shared after purchase.',
            requiresQuote: false,
            checkoutChargeCents: 0,
            basis: 'Local studio pickup',
            breakdown: [
                {
                    label: 'Local studio pickup',
                    amount: 'Free',
                    detail: 'The studio will coordinate a pickup time after payment',
                },
            ],
            checkoutBreakdown: [
                {
                    label: 'Local studio pickup',
                    amountCents: 0,
                    detail: 'The studio will coordinate a pickup time after payment',
                },
            ],
        };
    }

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return {
            classification: 'Studio quote',
            estimatedCarrierRange: 'Enter dimensions',
            explanation: 'Enter both artwork dimensions to receive a planning estimate.',
            requiresQuote: true,
            checkoutChargeCents: null,
            basis: destination === 'international' ? 'International quote' : 'U.S. delivery',
            breakdown: [],
            checkoutBreakdown: [],
        };
    }

    const classification =
        longestSide <= 10 && shortestSide <= 10
            ? ('Small' as const)
            : longestSide <= 20 && shortestSide <= 16
              ? ('Medium' as const)
              : longestSide <= 30 && shortestSide <= 24
                ? ('Large' as const)
                : null;

    const basis = `${width} × ${height} in · ${destination === 'international' ? 'International quote' : 'U.S. delivery'}`;

    if (!classification || destination === 'international') {
        return {
            classification: 'Studio quote',
            estimatedCarrierRange: 'Contact the studio',
            explanation:
                destination === 'international'
                    ? 'International delivery is arranged directly so Jill can confirm the carrier, insurance, and destination requirements.'
                    : 'This size requires a custom packing and insured delivery quote from the studio.',
            requiresQuote: true,
            checkoutChargeCents: null,
            basis,
            breakdown: [
                {
                    label: 'Custom packing and delivery',
                    amount: 'Quoted',
                    detail:
                        destination === 'international'
                            ? 'International carrier, insurance, duties, and destination requirements need review'
                            : 'The packed depth, weight, value, and destination need studio review',
                },
            ],
            checkoutBreakdown: [],
        };
    }

    const tier = SHIPPING_TIER_PRICES[classification];
    const checkoutCharge = framed ? tier.framed : tier.unframed;
    const checkoutDollars = checkoutCharge / 100;
    const breakdown: ShippingEstimate['breakdown'] = [
        {
            label: 'Size and delivery class',
            amount: `$${checkoutDollars}`,
            detail: `${classification} · ${tier.example}`,
        },
    ];
    const checkoutBreakdown: ShippingEstimate['checkoutBreakdown'] = [
        {
            label: `${classification} insured delivery`,
            amountCents: checkoutCharge,
            detail: framed ? 'Tier price includes framed-work protection' : 'Tier price for unframed artwork',
        },
    ];

    return {
        classification,
        estimatedCarrierRange: `$${checkoutDollars}`,
        explanation: framed
            ? 'Fixed insured U.S. shipping with the added edge and corner protection required for a framed work.'
            : 'Fixed insured U.S. shipping for this artwork’s size tier.',
        requiresQuote: false,
        checkoutChargeCents: checkoutCharge,
        basis,
        breakdown,
        checkoutBreakdown,
    };
}
