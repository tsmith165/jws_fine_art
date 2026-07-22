import { describe, expect, it } from 'vitest';
import {
    formatUploadBytes,
    MAX_UPLOAD_BYTES,
    parseUploadThingUrl,
    validateImageDimensions,
    validateUploadedImageReference,
    validateUploadFile,
} from '../../src/lib/uploadedImageReference';

describe('uploaded image references', () => {
    it('accepts configured UploadThing delivery URLs', () => {
        expect(parseUploadThingUrl('https://example.ufs.sh/f/example-key').hostname).toBe('example.ufs.sh');
        expect(parseUploadThingUrl('https://utfs.io/f/example-key').hostname).toBe('utfs.io');
    });

    it.each([
        'http://example.ufs.sh/f/key',
        'https://ufs.sh.evil.example/f/key',
        'https://user:password@example.ufs.sh/f/key',
        'https://example.com/image.jpg',
    ])('rejects unsafe media URL %s', (url) => {
        expect(() => parseUploadThingUrl(url)).toThrow('configured media provider');
    });

    it('normalizes a valid URL and validates dimensions', () => {
        expect(
            validateUploadedImageReference({
                url: 'https://example.ufs.sh/f/artwork.jpg',
                width: 6000,
                height: 4000,
            }),
        ).toEqual({ url: 'https://example.ufs.sh/f/artwork.jpg', width: 6000, height: 4000 });
    });

    it.each([
        [0, 100],
        [100, -1],
        [100.5, 100],
        [40_001, 100],
        [20_000, 10_000],
    ])('rejects invalid or unsafe dimensions %s x %s', (width, height) => {
        expect(() => validateImageDimensions(width, height)).toThrow();
    });
});

describe('upload file preflight', () => {
    it('accepts supported images under the provider limit', () => {
        expect(() => validateUploadFile({ name: 'painting.jpg', type: 'image/jpeg', size: 12 * 1024 * 1024 })).not.toThrow();
    });

    it('gives HEIC photos a specific conversion instruction', () => {
        expect(() => validateUploadFile({ name: 'IMG_1234.HEIC', type: 'image/heic', size: 5_000_000 })).toThrow('Export it as a JPEG');
    });

    it('rejects empty and oversized images before provider upload', () => {
        expect(() => validateUploadFile({ name: 'empty.png', type: 'image/png', size: 0 })).toThrow('empty');
        expect(() => validateUploadFile({ name: 'large.webp', type: 'image/webp', size: MAX_UPLOAD_BYTES + 1 })).toThrow('over 32 MB');
    });

    it('formats upload sizes for the review UI', () => {
        expect(formatUploadBytes(512 * 1024)).toBe('512 KB');
        expect(formatUploadBytes(3.25 * 1024 * 1024)).toBe('3.3 MB');
        expect(formatUploadBytes(18 * 1024 * 1024)).toBe('18 MB');
    });
});
