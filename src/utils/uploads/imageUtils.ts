import sharp from 'sharp';

export async function createSmallerImage(buffer: Buffer, maxSize: number): Promise<sharp.Sharp> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    const { width, height } = metadata;

    if (!width || !height) {
        throw new Error('Unable to get image dimensions');
    }

    const { updatedWidth, updatedHeight } = getUpdatedDimensions(width, height, maxSize);

    return image.resize(updatedWidth, updatedHeight, {
        fit: 'inside',
        withoutEnlargement: true,
    });
}

function getUpdatedDimensions(width: number, height: number, maxSize: number) {
    let updatedWidth = width;
    let updatedHeight = height;
    if (width > height) {
        if (width > maxSize) {
            updatedHeight = Math.round((height * maxSize) / width);
            updatedWidth = maxSize;
        }
    } else {
        if (height > maxSize) {
            updatedWidth = Math.round((width * maxSize) / height);
            updatedHeight = maxSize;
        }
    }
    return { updatedWidth, updatedHeight };
}
