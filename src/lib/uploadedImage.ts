import 'server-only';
import sharp from 'sharp';
import { parseUploadThingUrl } from './uploadedImageReference';

export { parseUploadThingUrl } from './uploadedImageReference';

const MAX_INSPECTION_BYTES = 40 * 1024 * 1024;
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_FORMATS = new Set(['jpeg', 'png', 'webp']);

async function readBoundedBody(response: Response): Promise<Buffer> {
    if (!response.body) throw new Error('The uploaded image returned an empty response.');
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > MAX_INSPECTION_BYTES) throw new Error('The uploaded image is too large to inspect.');
            chunks.push(value);
        }
    } finally {
        reader.releaseLock();
    }
    return Buffer.concat(chunks, total);
}

export async function inspectUploadThingImage(value: string): Promise<{ width: number; height: number }> {
    const url = parseUploadThingUrl(value);
    const response = await fetch(url, { cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error('The uploaded image could not be inspected.');
    const contentLength = Number(response.headers.get('content-length') ?? 0);
    if (contentLength > MAX_INSPECTION_BYTES) throw new Error('The uploaded image is too large to inspect.');
    const contentType = response.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
    if (!contentType || !ALLOWED_CONTENT_TYPES.has(contentType)) {
        throw new Error('Use a JPEG, PNG, or WebP image.');
    }
    const metadata = await sharp(await readBoundedBody(response), { failOn: 'error', limitInputPixels: 180_000_000 }).metadata();
    if (!metadata.width || !metadata.height || !metadata.format || !ALLOWED_FORMATS.has(metadata.format)) {
        throw new Error('The uploaded image format or dimensions could not be verified.');
    }
    const rotated = metadata.orientation !== undefined && metadata.orientation >= 5 && metadata.orientation <= 8;
    return rotated ? { width: metadata.height, height: metadata.width } : { width: metadata.width, height: metadata.height };
}
