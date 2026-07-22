export const MAX_UPLOAD_BYTES = 32 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 180_000_000;
export const MAX_IMAGE_EDGE = 40_000;

export const ALLOWED_UPLOAD_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export interface UploadedImageReference {
    url: string;
    width: number;
    height: number;
}

export function parseUploadThingUrl(value: string): URL {
    const parsed = new URL(value);
    const allowedHost = ['utfs.io', 'ufs.sh'].some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
    if (parsed.protocol !== 'https:' || !allowedHost || parsed.username || parsed.password) {
        throw new Error('Uploaded image URL is not from the configured media provider.');
    }
    return parsed;
}

export function validateImageDimensions(width: number, height: number): { width: number; height: number } {
    if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width <= 0 || height <= 0) {
        throw new Error('The image dimensions are invalid. Please choose the original again.');
    }
    if (width > MAX_IMAGE_EDGE || height > MAX_IMAGE_EDGE || width * height > MAX_IMAGE_PIXELS) {
        throw new Error('The image dimensions are too large. Export a JPEG, PNG, or WebP under 180 megapixels.');
    }
    return { width, height };
}

export function validateUploadedImageReference(reference: UploadedImageReference): UploadedImageReference {
    const url = parseUploadThingUrl(reference.url).toString();
    const dimensions = validateImageDimensions(reference.width, reference.height);
    return { url, ...dimensions };
}

export function validateUploadFile(file: Pick<File, 'name' | 'size' | 'type'>): void {
    if (!ALLOWED_UPLOAD_TYPES.has(file.type.toLowerCase())) {
        const isHeic = /\.(heic|heif)$/i.test(file.name) || /heic|heif/i.test(file.type);
        throw new Error(
            isHeic
                ? 'This photo is HEIC. Export it as a JPEG from Photos, then upload that original.'
                : 'Choose a JPEG, PNG, or WebP image.',
        );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new Error('This image is over 32 MB. Export a full-quality JPEG, PNG, or WebP under 32 MB.');
    }
    if (file.size <= 0) throw new Error('This image is empty. Choose a different original.');
}

export function formatUploadBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
}
