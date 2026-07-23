import { describe, expect, it } from 'vitest';
import { validateOwnerArtwork, type OwnerArtworkValidationInput } from '../../src/lib/ownerArtworkValidation';

const completeArtwork: OwnerArtworkValidationInput = {
    piece_title: 'Morning Light',
    piece_type: 'Oil On Panel',
    price: '495',
    real_width: '12',
    real_height: '9',
    description: 'Morning light settles across the coast after the marine layer lifts.',
    categories: ['coastal'],
    instagram: 'https://www.instagram.com/p/example/',
    available: true,
    sold: false,
};

describe('validateOwnerArtwork', () => {
    it('accepts a complete available artwork', () => {
        const result = validateOwnerArtwork(completeArtwork);
        expect(result.canSave).toBe(true);
        expect(result.errors).toEqual([]);
    });

    it('blocks an available listing with missing collector essentials', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            piece_type: '',
            price: '',
            real_width: '',
            description: '',
        });
        expect(result.canSave).toBe(false);
        expect(result.errors.map((issue) => issue.field)).toEqual(['piece_type', 'price', 'real_width', 'description']);
    });

    it('allows an incomplete private record while marking publish requirements as warnings', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            piece_type: '',
            price: '',
            real_width: '',
            real_height: '',
            description: '',
            available: false,
            sold: true,
        });
        expect(result.canSave).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings.map((issue) => issue.field)).toEqual(['piece_type', 'price', 'real_width', 'real_height', 'description']);
    });

    it('rejects malformed optional URLs and invalid dimensions in every status', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            real_height: '-2',
            instagram: '?igsh=broken',
            available: false,
            sold: false,
        });
        expect(result.errors.map((issue) => issue.field)).toEqual(['real_height', 'instagram']);
    });
});
