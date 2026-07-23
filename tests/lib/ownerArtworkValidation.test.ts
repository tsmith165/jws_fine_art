import { describe, expect, it } from 'vitest';
import {
    normalizeInstagramShareReference,
    validateOwnerArtwork,
    type OwnerArtworkValidationInput,
} from '../../src/lib/ownerArtworkValidation';

const completeArtwork: OwnerArtworkValidationInput = {
    piece_title: 'Morning Light',
    piece_type: 'Oil On Panel',
    released_at: '2026-07-01',
    price: '495',
    real_width: '12',
    real_height: '9',
    description: 'Morning light settles across the coast after the marine layer lifts.',
    categories: ['coastal'],
    instagram: 'Mzc3ZTVlOWMwZA%3D%3D',
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
            released_at: '',
            price: '',
            real_width: '',
            description: '',
        });
        expect(result.canSave).toBe(false);
        expect(result.errors.map((issue) => issue.field)).toEqual(['piece_type', 'released_at', 'price', 'real_width', 'description']);
    });

    it('allows an incomplete private record while marking publish requirements as warnings', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            piece_type: '',
            released_at: '',
            price: '',
            real_width: '',
            real_height: '',
            description: '',
            available: false,
            sold: true,
        });
        expect(result.canSave).toBe(true);
        expect(result.errors).toEqual([]);
        expect(result.warnings.map((issue) => issue.field)).toEqual([
            'piece_type',
            'released_at',
            'price',
            'real_width',
            'real_height',
            'description',
        ]);
    });

    it('accepts compact Instagram share references', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            instagram: 'Mzc3ZTVlOWMwZA%3D%3D',
        });
        expect(result.byField.has('instagram')).toBe(false);
        expect(result.canSave).toBe(true);
    });

    it('reduces a pasted Instagram URL to its share reference', () => {
        expect(
            normalizeInstagramShareReference('https://www.instagram.com/p/example/?igsh=Mzc3ZTVlOWMwZA%3D%3D&utm_source=ig_web_copy_link'),
        ).toBe('Mzc3ZTVlOWMwZA%3D%3D');
        expect(normalizeInstagramShareReference('?igsh=Mzc3ZTVlOWMwZA%3D%3D')).toBe('Mzc3ZTVlOWMwZA%3D%3D');
        expect(normalizeInstagramShareReference('Mzc3ZTVlOWMwZA%3D%3D')).toBe('Mzc3ZTVlOWMwZA%3D%3D');
    });

    it('rejects invalid dimensions in every status', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            real_height: '-2',
            available: false,
            sold: false,
        });
        expect(result.errors.map((issue) => issue.field)).toEqual(['real_height']);
    });

    it('rejects full Instagram links and malformed references', () => {
        const result = validateOwnerArtwork({
            ...completeArtwork,
            instagram: 'https://www.instagram.com/p/example/',
        });
        expect(result.byField.get('instagram')?.message).toBe('Paste only the Instagram share token that appears after ?igsh=.');
    });

    it('rejects malformed and future release dates', () => {
        const malformed = validateOwnerArtwork({ ...completeArtwork, released_at: 'July 1' });
        expect(malformed.byField.get('released_at')?.message).toBe('Choose a valid release date.');

        const future = validateOwnerArtwork({ ...completeArtwork, released_at: '2099-01-01' });
        expect(future.byField.get('released_at')?.message).toBe('Release date cannot be in the future.');
    });
});
