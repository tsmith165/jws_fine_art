import { describe, expect, it } from 'vitest';
import {
    clampGalleryPlacement,
    galleryPlacementFitsWall,
    galleryPlacementsOverlap,
    galleryWallLayoutIssues,
} from '../../shared/galleryWallLayout';

const wall = { widthInches: 120, heightInches: 96 };

describe('gallery wall layout', () => {
    it('detects bounds and clamps placement centers in physical inches', () => {
        const outside = { id: 'a', centerXInches: 2, centerYInches: 2, widthInches: 20, heightInches: 16 };
        expect(galleryPlacementFitsWall(wall, outside)).toBe(false);
        expect(clampGalleryPlacement(wall, outside)).toMatchObject({ centerXInches: 10, centerYInches: 8 });
    });

    it('allows touching edges but rejects overlapping artworks', () => {
        const a = { id: 'a', centerXInches: 20, centerYInches: 20, widthInches: 20, heightInches: 20 };
        const touching = { id: 'b', centerXInches: 40, centerYInches: 20, widthInches: 20, heightInches: 20 };
        const overlapping = { ...touching, centerXInches: 39 };
        expect(galleryPlacementsOverlap(a, touching)).toBe(false);
        expect(galleryPlacementsOverlap(a, overlapping)).toBe(true);
    });

    it('returns every publishing issue without mutating the composition', () => {
        const placements = [
            { id: 'a', centerXInches: 10, centerYInches: 10, widthInches: 20, heightInches: 20 },
            { id: 'b', centerXInches: 15, centerYInches: 15, widthInches: 20, heightInches: 20 },
            { id: 'c', centerXInches: 118, centerYInches: 20, widthInches: 10, heightInches: 10 },
        ];
        expect(galleryWallLayoutIssues(wall, placements)).toEqual({
            outOfBoundsIds: ['c'],
            overlappingPairs: [['a', 'b']],
            valid: false,
        });
    });
});
