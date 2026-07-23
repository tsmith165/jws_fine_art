import { describe, expect, it } from 'vitest';
import { ownerArtworkAttention } from '../../src/lib/ownerArtworkAttention';
import type { PiecesWithImages } from '../../src/types/artwork';

const completeArtwork: PiecesWithImages = {
    id: 1,
    o_id: 1,
    p_id: 1,
    class_name: 'piece',
    title: 'Morning Light',
    image_path: 'https://example.com/original.jpg',
    width: 1920,
    height: 1430,
    small_image_path: null,
    small_width: null,
    small_height: null,
    price: 495,
    released_at: Date.UTC(2026, 6, 1, 12),
    sold: false,
    available: true,
    description: 'Morning light settles across the coast after the marine layer lifts.',
    piece_type: 'Oil On Panel',
    instagram: '',
    real_width: 12,
    real_height: 9,
    active: true,
    theme: 'Coastal',
    categories: ['coastal'],
    framed: false,
    comments: null,
    extraImages: [],
    progressImages: [],
};

describe('ownerArtworkAttention', () => {
    it('returns no issues for a complete artwork with a strong source', () => {
        expect(ownerArtworkAttention(completeArtwork)).toEqual([]);
    });

    it('groups low-resolution, metadata, and taxonomy work in one queue', () => {
        const issues = ownerArtworkAttention({
            ...completeArtwork,
            width: 1024,
            height: 768,
            piece_type: null,
            released_at: null,
            categories: [],
        });

        expect(issues.map((issue) => issue.kind)).toEqual(['image', 'metadata', 'metadata', 'category']);
        expect(issues[0].detail).toContain('1,024 × 768 px');
        expect(issues.some((issue) => issue.label === 'Medium')).toBe(true);
        expect(issues.some((issue) => issue.label === 'Release date')).toBe(true);
    });

    it('also checks supporting and process originals', () => {
        const issues = ownerArtworkAttention({
            ...completeArtwork,
            extraImages: [
                {
                    id: 2,
                    piece_id: 1,
                    title: 'Frame detail',
                    image_path: 'https://example.com/supporting.jpg',
                    width: 700,
                    height: 700,
                    small_image_path: null,
                    small_width: null,
                    small_height: null,
                },
            ],
            progressImages: [
                {
                    id: 3,
                    piece_id: 1,
                    title: null,
                    image_path: 'https://example.com/process.jpg',
                    width: 1600,
                    height: 1200,
                    small_image_path: null,
                    small_width: null,
                    small_height: null,
                },
            ],
        });

        expect(issues).toHaveLength(1);
        expect(issues[0].label).toBe('Frame detail needs a larger original');
    });

    it('keeps a seeded release date in the queue until it differs from completion', () => {
        const completedAt = Date.UTC(2026, 5, 10, 12);
        const issues = ownerArtworkAttention({
            ...completeArtwork,
            completed_at: completedAt,
            released_at: completedAt,
        });

        expect(issues).toEqual([
            expect.objectContaining({
                id: 'metadata-released_at-unreviewed',
                label: 'Release date needs review',
                editorAnchor: 'artwork-release-date',
            }),
        ]);
    });
});
