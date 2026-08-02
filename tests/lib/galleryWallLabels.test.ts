import { describe, expect, it } from 'vitest';
import { normalizeGalleryWallLabelMode } from '../../shared/galleryWallLabels';

describe('normalizeGalleryWallLabelMode', () => {
    it.each([
        ['left', 'bottom-left'],
        ['bottom-left', 'bottom-left'],
        ['right', 'bottom-right'],
        ['bottom-right', 'bottom-right'],
        ['hidden', 'hidden'],
        [undefined, 'hidden'],
        [null, 'hidden'],
    ] as const)('normalizes %s to %s', (input, expected) => {
        expect(normalizeGalleryWallLabelMode(input)).toBe(expected);
    });
});
