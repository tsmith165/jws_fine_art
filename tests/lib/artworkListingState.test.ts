import { describe, expect, it } from 'vitest';
import { artworkAvailabilityForStatus, artworkListingStatus, normalizeArtworkAvailability } from '../../shared/artworkListingState';

describe('artwork listing state', () => {
    it('maps each visible status to one unambiguous pair of flags', () => {
        expect(artworkAvailabilityForStatus('available')).toEqual({ available: true, sold: false });
        expect(artworkAvailabilityForStatus('sold')).toEqual({ available: false, sold: true });
        expect(artworkAvailabilityForStatus('not-for-sale')).toEqual({ available: false, sold: false });
    });

    it('prefers an explicit available state over a stale sold flag', () => {
        expect(normalizeArtworkAvailability({ available: true, sold: true })).toEqual({ available: true, sold: false });
        expect(artworkListingStatus({ available: true, sold: true })).toBe('available');
    });
});
