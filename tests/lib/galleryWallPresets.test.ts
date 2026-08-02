import { access } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { GALLERY_WALL_PRESETS, galleryWallPreset, galleryWallSurfaceStyle } from '../../src/lib/galleryWallPresets';

describe('gallery wall presets', () => {
    it('defines five unique environments with deployable assets', async () => {
        expect(GALLERY_WALL_PRESETS).toHaveLength(5);
        expect(new Set(GALLERY_WALL_PRESETS.map((preset) => preset.key)).size).toBe(GALLERY_WALL_PRESETS.length);

        await Promise.all(GALLERY_WALL_PRESETS.map((preset) => access(path.join(process.cwd(), 'public', preset.image))));
    });

    it('falls back safely and produces a photographic surface style', () => {
        expect(galleryWallPreset('midnight').label).toBe('Midnight spotlight');
        expect(galleryWallSurfaceStyle('white-oak')).toMatchObject({
            backgroundImage: 'url("/images/gallery-walls/white-bench-gallery.webp")',
        });
    });
});
