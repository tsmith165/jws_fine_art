import { describe, expect, it } from 'vitest';
import { estimateArtworkShipping } from '../../src/lib/shipping';

describe('estimateArtworkShipping', () => {
    it('classifies small unframed work as compact', () => {
        expect(estimateArtworkShipping({ width: 12, height: 9, framed: false, care: 'standard' }).classification).toBe('Compact');
    });

    it('accounts for frames and delicate handling', () => {
        const estimate = estimateArtworkShipping({ width: 30, height: 24, framed: true, care: 'delicate' });
        expect(estimate.classification).toBe('Oversize');
        expect(estimate.requiresQuote).toBe(true);
    });

    it('requires dimensions before estimating', () => {
        expect(estimateArtworkShipping({ width: 0, height: 12, framed: false, care: 'standard' }).requiresQuote).toBe(true);
    });
});
