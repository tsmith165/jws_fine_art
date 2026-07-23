import { describe, expect, it } from 'vitest';
import { reorderArtworkMedia } from '../../src/lib/ownerMediaOrdering';

const media = [
    { id: 'primary', kind: 'primary' as const },
    { id: 11, kind: 'extra' as const },
    { id: 12, kind: 'extra' as const },
    { id: 13, kind: 'extra' as const },
    { id: 21, kind: 'progress' as const },
    { id: 22, kind: 'progress' as const },
];

describe('reorderArtworkMedia', () => {
    it('inserts supporting media at the requested position', () => {
        expect(reorderArtworkMedia(media, 11, 13).map((item) => item.id)).toEqual(['primary', 12, 13, 11, 21, 22]);
    });

    it('reorders process media independently', () => {
        expect(reorderArtworkMedia(media, 22, 21).map((item) => item.id)).toEqual(['primary', 11, 12, 13, 22, 21]);
    });

    it('keeps the primary fixed and ignores cross-role drops', () => {
        expect(reorderArtworkMedia(media, 'primary', 11)).toBe(media);
        expect(reorderArtworkMedia(media, 11, 21)).toBe(media);
    });
});
