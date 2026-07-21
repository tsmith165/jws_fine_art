import { describe, expect, it } from 'vitest';
import { filterCategorizerArtworks } from '../../src/lib/ownerArtworkFilters';

describe('filterCategorizerArtworks', () => {
    it('keeps active artwork and excludes archived or inactive records', () => {
        const artworks = [
            { id: 1, title: 'Active work', active: true },
            { id: 2, title: 'Archived work', active: false },
            { id: 3, title: 'Unknown legacy state', active: null },
        ];

        expect(filterCategorizerArtworks(artworks)).toEqual([artworks[0]]);
    });
});
