import { describe, expect, it } from 'vitest';
import { estimateArtworkShipping, shippingCareForMedium } from '../../src/lib/shipping';

describe('estimateArtworkShipping', () => {
    it('classifies small unframed work as compact', () => {
        const estimate = estimateArtworkShipping({ width: 12, height: 9, framed: false, care: 'standard' });
        expect(estimate.classification).toBe('Compact');
        expect(estimate.estimatedCarrierRange).toBe('$35–$75');
        expect(estimate.checkoutChargeCents).toBe(5500);
        expect(estimate.breakdown).toHaveLength(1);
    });

    it('itemizes frames and delicate handling in the total range', () => {
        const estimate = estimateArtworkShipping({ width: 30, height: 24, framed: true, care: 'delicate' });
        expect(estimate.classification).toBe('Standard');
        expect(estimate.estimatedCarrierRange).toBe('$130–$265');
        expect(estimate.checkoutChargeCents).toBe(20500);
        expect(estimate.checkoutBreakdown.map((item) => item.amountCents)).toEqual([11500, 3500, 5500]);
        expect(estimate.breakdown.map((item) => item.label)).toEqual([
            'Size and delivery class',
            'Framed-work protection',
            'Delicate or glazed handling',
        ]);
    });

    it('adds and explains an international route range', () => {
        const estimate = estimateArtworkShipping({
            width: 12,
            height: 9,
            framed: false,
            care: 'standard',
            destination: 'international',
        });
        expect(estimate.estimatedCarrierRange).toBe('$130–$265');
        expect(estimate.requiresQuote).toBe(false);
        expect(estimate.checkoutChargeCents).toBe(20000);
        expect(estimate.breakdown.at(-1)).toMatchObject({
            label: 'International route',
            amount: '+$95–$190',
        });
        expect(estimate.explanation).toContain('not destination duties or taxes');
    });

    it('requires dimensions before estimating', () => {
        const estimate = estimateArtworkShipping({ width: 0, height: 12, framed: false, care: 'standard' });
        expect(estimate.requiresQuote).toBe(true);
        expect(estimate.checkoutChargeCents).toBeNull();
        expect(estimate.estimatedCarrierRange).toBe('Enter dimensions');
        expect(estimate.breakdown).toEqual([]);
    });

    it('routes very large work to a custom quote', () => {
        const estimate = estimateArtworkShipping({
            width: 60,
            height: 40,
            framed: true,
            care: 'delicate',
            destination: 'international',
        });
        expect(estimate.classification).toBe('Studio quote');
        expect(estimate.estimatedCarrierRange).toBe('Custom quote required');
        expect(estimate.checkoutChargeCents).toBeNull();
        expect(estimate.breakdown[0]?.amount).toBe('Quoted');
    });

    it('derives delicate handling from paper and pastel media', () => {
        expect(shippingCareForMedium('Pastel On Paper')).toBe('delicate');
        expect(shippingCareForMedium('Linocut On Paper')).toBe('delicate');
        expect(shippingCareForMedium('Oil On Panel')).toBe('standard');
    });
});
