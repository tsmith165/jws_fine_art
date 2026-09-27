import { describe, expect, it } from 'vitest';
import {
    artworkImageAspectRatio,
    artworkShippingDimensions,
    estimateFramedDimensions,
    finishedArtworkDimensions,
    fitArtworkImageToDimensions,
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
        expect(artworkShippingDimensions(framed, true)).toMatchObject({
            widthInches: 13,
            heightInches: 13,
            source: 'framed-estimate',
            estimated: true,
        });
    });

    it('blocks strict finished-size shipping for an incomplete framed pair', () => {
        const incomplete = { framed: true, widthInches: 12, heightInches: 9, framedWidthInches: 15 };
        expect(artworkShippingDimensions(incomplete, false)).toMatchObject({ widthInches: 12, heightInches: 9 });
        expect(artworkShippingDimensions(incomplete, true)).toBeNull();
    });

    it('fits a wider photo inside an estimated framed footprint instead of trimming its sides', () => {
        // Crashing Light: 39 × 27 in estimated frame, 1920 × 1266 photo.
        const fitted = fitArtworkImageToDimensions({ widthInches: 39, heightInches: 27 }, { width: 1920, height: 1266 });
        expect(fitted.widthInches).toBe(39);
        expect(fitted.heightInches).toBeLessThan(27);
        expect(fitted.widthInches / fitted.heightInches).toBeCloseTo(1920 / 1266, 6);
    });

    it('fits a narrower photo by height so it never exceeds the footprint', () => {
        const fitted = fitArtworkImageToDimensions({ widthInches: 12, heightInches: 15 }, { width: 820, height: 1080 });
        expect(fitted.heightInches).toBe(15);
        expect(fitted.widthInches).toBeLessThan(12);
        expect(fitted.widthInches / fitted.heightInches).toBeCloseTo(820 / 1080, 6);
    });

    it('uses the visible proportions after a presentation crop', () => {
        const crop = { top: 0, right: 0.1, bottom: 0, left: 0.1 };
        expect(artworkImageAspectRatio({ width: 1000, height: 1000, crop })).toBeCloseTo(0.8, 6);
        expect(fitArtworkImageToDimensions({ widthInches: 20, heightInches: 20 }, { width: 1000, height: 1000, crop })).toEqual({
            widthInches: 16,
            heightInches: 20,
        });
    });

    it('keeps the footprint when image proportions are unknown or unusable', () => {
        const footprint = { widthInches: 15, heightInches: 12 };
        expect(fitArtworkImageToDimensions(footprint, { width: null, height: 900 })).toEqual(footprint);
        expect(fitArtworkImageToDimensions(footprint, { width: 1200, height: 0 })).toEqual(footprint);
        expect(
            fitArtworkImageToDimensions(footprint, { width: 1200, height: 900, crop: { top: 0, right: 0.5, bottom: 0, left: 0.5 } }),
        ).toEqual(footprint);
    });
});
