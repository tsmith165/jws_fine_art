import { describe, expect, it } from 'vitest';
import { deriveArtworkCategories, resolveArtworkCategory } from '../../shared/artworkCategories';

describe('artwork categories', () => {
    it('derives multiple canonical categories without treating every landscape as coastal', () => {
        expect(deriveArtworkCategories({ theme: 'Water, City, Landscape', medium: 'Linocut On Paper' })).toEqual([
            'coastal',
            'urban',
            'intaglio-lino-cut',
        ]);
        expect(deriveArtworkCategories({ theme: 'Landscape', medium: 'Oil On Panel' })).toEqual([]);
    });

    it('keeps legacy category URLs working', () => {
        expect(resolveArtworkCategory('water')).toBe('coastal');
        expect(resolveArtworkCategory('snow')).toBe('mountain');
        expect(resolveArtworkCategory('city')).toBe('urban');
    });
});
