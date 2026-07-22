import { validateImageDimensions } from './uploadedImageReference';

function loadWithImageElement(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const image = new Image();
        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(validateImageDimensions(image.naturalWidth, image.naturalHeight));
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('This image could not be opened. Export it as a JPEG, PNG, or WebP and try again.'));
        };
        image.src = objectUrl;
    });
}

export async function readClientImageDimensions(file: File): Promise<{ width: number; height: number }> {
    if (typeof createImageBitmap !== 'function') return loadWithImageElement(file);
    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const dimensions = validateImageDimensions(bitmap.width, bitmap.height);
        bitmap.close();
        return dimensions;
    } catch {
        return loadWithImageElement(file);
    }
}
