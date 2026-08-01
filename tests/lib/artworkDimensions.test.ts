import { describe, expect, it } from 'vitest';
import {
    artworkShippingDimensions,
    estimateFramedDimensions,
    finishedArtworkDimensions,
    roundToQuarterInch,
} from '../../shared/artworkDimensions';

describe('artwork dimensions', () => {
    it('estimates a provisional outside-frame size to the nearest quarter inch', () => {
        expect(estimateFramedDimensions(12.1, 9.1)).toEqual({ widthInches: 15, heightInches: 12 });
        expect(roundToQuarterInch(15.13)).toBe(15.25);
    });

    it('uses artwork dimensions for unframed work', () => {
        expect(finishedArtworkDimensions({ framed: false, widthInches: 12, heightInches: 9 })).toEqual({
            widthInches: 12,
            heightInches: 9,
            source: 'artwork',
            estimated: false,
        });
    });

    it('never silently falls back to the smaller artwork dimensions for framed work', () => {
        expect(finishedArtworkDimensions({ framed: true, widthInches: 12, heightInches: 9 })).toBeNull();
        expect(
            finishedArtworkDimensions({
                framed: true,
                widthInches: 12,
                heightInches: 9,
                framedWidthInches: 15,
                framedHeightInches: null,
            }),
        ).toBeNull();
    });

    it('preserves estimated and verified provenance', () => {
        expect(
            finishedArtworkDimensions({
                framed: true,
                widthInches: 12,
                heightInches: 9,
                framedWidthInches: 15,
                framedHeightInches: 12,
                framedDimensionsVerified: false,
            }),
        ).toMatchObject({ source: 'framed-estimate', estimated: true });
        expect(
            finishedArtworkDimensions({
                framed: true,
                widthInches: 12,
                heightInches: 9,
                framedWidthInches: 15,
                framedHeightInches: 12,
                framedDimensionsVerified: true,
            }),
        ).toMatchObject({ source: 'framed-verified', estimated: false });
    });

    it('keeps legacy shipping dimensions until the finished-frame policy is explicitly enabled', () => {
        const framed = {
            framed: true,
            widthInches: 10,
            heightInches: 10,
            framedWidthInches: 13,
            framedHeightInches: 13,
            framedDimensionsVerified: false,
        };
        expect(artworkShippingDimensions(framed, false)).toMatchObject({ widthInches: 10, heightInches: 10, source: 'artwork' });
        expect(artworkShippingDimensions(framed, true)).toMatchObject({ widthInches: 13, heightInches: 13, source: 'framed-estimate', estimated: true });
    });

    it('blocks strict finished-size shipping for an incomplete framed pair', () => {
        const incomplete = { framed: true, widthInches: 12, heightInches: 9, framedWidthInches: 15 };
        expect(artworkShippingDimensions(incomplete, false)).toMatchObject({ widthInches: 12, heightInches: 9 });
        expect(artworkShippingDimensions(incomplete, true)).toBeNull();
    });
});
