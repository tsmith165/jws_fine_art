import { describe, expect, it } from 'vitest';
import { galleryWallLayoutIssues } from '../../shared/galleryWallLayout';
import { suggestGalleryWallLayout } from '../../shared/galleryWallSuggestions';

const wall = { widthInches: 144, heightInches: 96 };
const placements = [
    { id: 'a', centerXInches: 20, centerYInches: 20, widthInches: 23, heightInches: 19 },
    { id: 'b', centerXInches: 22, centerYInches: 20, widthInches: 15, heightInches: 12 },
    { id: 'c', centerXInches: 24, centerYInches: 20, widthInches: 13, heightInches: 11 },
    { id: 'd', centerXInches: 26, centerYInches: 20, widthInches: 11, heightInches: 9 },
    { id: 'e', centerXInches: 28, centerYInches: 20, widthInches: 15, heightInches: 12 },
    { id: 'f', centerXInches: 30, centerYInches: 20, widthInches: 9, heightInches: 9 },
    { id: 'g', centerXInches: 32, centerYInches: 20, widthInches: 10, heightInches: 8 },
];

describe('gallery wall layout suggestions', () => {
    it('returns valid, hand-editable coordinates across different suggestions', () => {
        for (let seed = 1; seed <= 20; seed += 1) {
            const arranged = suggestGalleryWallLayout(wall, placements, seed);
            expect(arranged.map((placement) => placement.id)).toEqual(placements.map((placement) => placement.id));
            expect(galleryWallLayoutIssues(wall, arranged).valid).toBe(true);
        }
    });

    it('centers a single work and produces different multi-work suggestions', () => {
        expect(suggestGalleryWallLayout(wall, [placements[0]], 1)[0]).toMatchObject({ centerXInches: 72, centerYInches: 46.08 });
        expect(suggestGalleryWallLayout(wall, placements, 2)).not.toEqual(suggestGalleryWallLayout(wall, placements, 3));
    });
});
