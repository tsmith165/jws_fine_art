import { describe, expect, it } from 'vitest';
import { planImportedFieldMerge } from '../../convex/lib/importMerge';
import { legacyArtworkSlug, normalizeLegacyBoolean } from '../../convex/lib/legacy';
import { canonicalJson, sourceHash } from '../../scripts/migration/shared';

describe('legacy migration primitives', () => {
    it('generates deterministic immutable ID-suffixed slugs', () => {
        expect(legacyArtworkSlug('  Café & Coast! ', 42)).toBe('cafe-and-coast-42');
        expect(legacyArtworkSlug('***', 9)).toBe('untitled-9');
    });

    it('normalizes nullable booleans only through explicit defaults', () => {
        expect(normalizeLegacyBoolean(null, true)).toBe(true);
        expect(normalizeLegacyBoolean(null, false)).toBe(false);
        expect(normalizeLegacyBoolean(false, true)).toBe(false);
    });

    it('hashes source objects independently of object key order', () => {
        expect(canonicalJson({ z: 1, a: { c: 3, b: 2 } })).toBe('{"a":{"b":2,"c":3},"z":1}');
        expect(sourceHash({ z: 1, a: 2 })).toBe(sourceHash({ a: 2, z: 1 }));
    });

    it('never overwrites owner-mutated fields during a source delta', () => {
        const result = planImportedFieldMerge({
            existing: { title: 'Owner title', priceCents: 200 },
            imported: { title: 'New source title', priceCents: 300 },
            fields: ['title', 'priceCents'] as const,
            ownerMutatedFields: ['title'],
        });

        expect(result.patch).toEqual({ priceCents: 300 });
        expect(result.conflicts).toEqual(['title']);
    });
});
