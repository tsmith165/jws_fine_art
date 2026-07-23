import { describe, expect, it } from 'vitest';
import {
    compareArtworkReleasedNewest,
    isFutureReleaseDate,
    releaseDateLabel,
    releaseDateTimestamp,
    releaseDateValue,
} from '../../shared/artworkRelease';

describe('artwork release dates', () => {
    it('round trips a date without timezone drift', () => {
        const timestamp = releaseDateTimestamp('2024-02-29');
        expect(timestamp).not.toBeNull();
        expect(releaseDateValue(timestamp)).toBe('2024-02-29');
        expect(releaseDateLabel(timestamp)).toBe('February 29, 2024');
    });

    it('rejects malformed or impossible dates', () => {
        expect(releaseDateTimestamp('February 29, 2024')).toBeNull();
        expect(releaseDateTimestamp('2023-02-29')).toBeNull();
        expect(releaseDateTimestamp('')).toBeNull();
    });

    it('compares future dates by calendar day', () => {
        const now = releaseDateTimestamp('2026-07-23')!;
        expect(isFutureReleaseDate(releaseDateTimestamp('2026-07-24')!, now)).toBe(true);
        expect(isFutureReleaseDate(releaseDateTimestamp('2026-07-23')!, now)).toBe(false);
    });

    it('orders released work newest first and leaves unset legacy work last', () => {
        const works = [
            { id: 3, released_at: null },
            { id: 1, released_at: releaseDateTimestamp('2024-03-01') },
            { id: 2, released_at: releaseDateTimestamp('2025-06-12') },
        ];
        expect(works.sort(compareArtworkReleasedNewest).map((work) => work.id)).toEqual([2, 1, 3]);
    });
});
