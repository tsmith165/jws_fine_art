import { describe, expect, it } from 'vitest';
import { estimateArtworkShipping, shippingCareForMedium } from '../../src/lib/shipping';

describe('estimateArtworkShipping', () => {
    it('uses the fixed small unframed tier', () => {
        const estimate = estimateArtworkShipping({ width: 10, height: 8, framed: false, care: 'standard' });
        expect(estimate.classification).toBe('Small');
        expect(estimate.estimatedCarrierRange).toBe('$25');
        expect(estimate.checkoutChargeCents).toBe(2500);
        expect(estimate.checkoutBreakdown[0]?.detail).toContain('unframed');
    });

    it('uses the fixed framed price for the canonical medium tier', () => {
        const estimate = estimateArtworkShipping({ width: 20, height: 16, framed: true, care: 'delicate' });
        expect(estimate.classification).toBe('Medium');
        expect(estimate.estimatedCarrierRange).toBe('$75');
        expect(estimate.checkoutChargeCents).toBe(7500);
        expect(estimate.checkoutBreakdown[0]?.detail).toContain('framed-work protection');
    });

    it('normalizes portrait and landscape orientations into the same tier', () => {
        const portrait = estimateArtworkShipping({ width: 16, height: 20, framed: false, care: 'standard' });
        const landscape = estimateArtworkShipping({ width: 20, height: 16, framed: false, care: 'standard' });
        expect(portrait.classification).toBe('Medium');
        expect(landscape.classification).toBe('Medium');
        expect(portrait.checkoutChargeCents).toBe(5000);
        expect(landscape.checkoutChargeCents).toBe(5000);
    });

    it('routes international delivery to a studio quote', () => {
        const estimate = estimateArtworkShipping({
            width: 12,
            height: 9,
            framed: false,
            care: 'standard',
            destination: 'international',
        });
        expect(estimate.classification).toBe('Studio quote');
        expect(estimate.estimatedCarrierRange).toBe('Contact the studio');
        expect(estimate.requiresQuote).toBe(true);
        expect(estimate.checkoutChargeCents).toBeNull();
        expect(estimate.explanation).toContain('International delivery');
    });

    it('makes local pickup free without requiring dimensions', () => {
        const estimate = estimateArtworkShipping({
            width: 0,
            height: 0,
            framed: true,
            care: 'delicate',
            destination: 'pickup',
        });
        expect(estimate.classification).toBe('Local pickup');
        expect(estimate.checkoutChargeCents).toBe(0);
        expect(estimate.requiresQuote).toBe(false);
        expect(estimate.estimatedCarrierRange).toBe('Free');
    });

    it('requires dimensions before estimating U.S. shipping', () => {
        const estimate = estimateArtworkShipping({ width: 0, height: 12, framed: false, care: 'standard' });
        expect(estimate.requiresQuote).toBe(true);
        expect(estimate.checkoutChargeCents).toBeNull();
        expect(estimate.estimatedCarrierRange).toBe('Enter dimensions');
    });

    it('routes artwork above 24 × 30 to a custom quote', () => {
        const estimate = estimateArtworkShipping({
            width: 31,
            height: 24,
            framed: true,
            care: 'delicate',
            destination: 'domestic',
        });
        expect(estimate.classification).toBe('Studio quote');
        expect(estimate.estimatedCarrierRange).toBe('Contact the studio');
        expect(estimate.checkoutChargeCents).toBeNull();
        expect(estimate.breakdown[0]?.amount).toBe('Quoted');
    });

    it('retains medium-derived handling metadata for future policy use', () => {
        expect(shippingCareForMedium('Pastel On Paper')).toBe('delicate');
        expect(shippingCareForMedium('Linocut On Paper')).toBe('delicate');
        expect(shippingCareForMedium('Oil On Panel')).toBe('standard');
    });
});
