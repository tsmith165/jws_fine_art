export type ShippingCare = 'standard' | 'delicate';

export type ShippingEstimate = {
    classification: 'Compact' | 'Standard' | 'Oversize' | 'Studio quote';
    estimatedCarrierRange: string;
    explanation: string;
    requiresQuote: boolean;
};

export function estimateArtworkShipping({
    width,
    height,
    framed,
    care,
}: {
    width: number;
    height: number;
    framed: boolean;
    care: ShippingCare;
}): ShippingEstimate {
    const longestSide = Math.max(width, height);
    const shortestSide = Math.min(width, height);
    const handlingAdjustment = Number(framed) * 5 + Number(care === 'delicate') * 6;
    const adjustedLongestSide = longestSide + handlingAdjustment;

    if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
        return {
            classification: 'Studio quote',
            estimatedCarrierRange: 'Contact the studio',
            explanation: 'Enter both artwork dimensions to receive a planning estimate.',
            requiresQuote: true,
        };
    }

    if (adjustedLongestSide <= 18 && shortestSide <= 14) {
        return {
            classification: 'Compact',
            estimatedCarrierRange: '$35–$75',
            explanation: 'Typically suitable for an insured art mailer or compact double-boxed package.',
            requiresQuote: false,
        };
    }
    if (adjustedLongestSide <= 34 && shortestSide <= 26) {
        return {
            classification: 'Standard',
            estimatedCarrierRange: '$75–$150',
            explanation: 'Typically double-boxed with corner protection and insured ground delivery.',
            requiresQuote: false,
        };
    }
    if (adjustedLongestSide <= 48 && shortestSide <= 36) {
        return {
            classification: 'Oversize',
            estimatedCarrierRange: '$150–$300',
            explanation: 'Oversize packing and carrier surcharges are likely. The studio will confirm the delivery plan.',
            requiresQuote: true,
        };
    }
    return {
        classification: 'Studio quote',
        estimatedCarrierRange: 'Custom quote required',
        explanation: 'This size may require a custom crate, art handler, or local delivery arrangement.',
        requiresQuote: true,
    };
}
