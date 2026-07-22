import { describe, expect, it } from 'vitest';
import { adjacentImageIndexes } from '../../src/lib/imageLoading';

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
