import { describe, expect, it } from 'vitest';
import {
    adjacentImageIndexes,
    artworkSourceQuality,
    CATALOG_ARTWORK_IMAGE_POLICY,
    PUBLIC_ARTWORK_SOURCE_MINIMUM,
} from '../../src/lib/imageLoading';

describe('CATALOG_ARTWORK_IMAGE_POLICY', () => {
    it('keeps public artwork cards on the high-fidelity delivery profile', () => {
        expect(CATALOG_ARTWORK_IMAGE_POLICY.quality).toBeGreaterThanOrEqual(95);
        expect(CATALOG_ARTWORK_IMAGE_POLICY.sizes).toContain('(max-width: 700px) 100vw');
        expect(CATALOG_ARTWORK_IMAGE_POLICY.sizes).toContain('840px');
    });
});

describe('artworkSourceQuality', () => {
    it('requires both artwork source edges to meet the public target', () => {
        expect(artworkSourceQuality(1920, 1430).ready).toBe(true);
        expect(artworkSourceQuality(1024, 768).ready).toBe(false);
        expect(artworkSourceQuality(0, 0).ready).toBe(false);
        expect(PUBLIC_ARTWORK_SOURCE_MINIMUM).toEqual({ longEdge: 1200, shortEdge: 900 });
    });
});

describe('adjacentImageIndexes', () => {
    it('returns no work for a single image', () => {
        expect(adjacentImageIndexes(1, 0)).toEqual([]);
    });

    it('returns one unique neighbor for two images', () => {
        expect(adjacentImageIndexes(2, 0)).toEqual([1]);
    });

    it('wraps around while keeping the warmup bounded', () => {
        expect(adjacentImageIndexes(5, 0)).toEqual([4, 1]);
        expect(adjacentImageIndexes(5, 4)).toEqual([3, 0]);
    });
});
