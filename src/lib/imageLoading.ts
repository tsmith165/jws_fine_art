export const CATALOG_ARTWORK_IMAGE_POLICY = {
    sizes: '(max-width: 700px) 100vw, (max-width: 1100px) 70vw, 840px',
    quality: 95,
} as const;

export const PUBLIC_ARTWORK_SOURCE_MINIMUM = {
    longEdge: 1200,
    shortEdge: 900,
} as const;

export function artworkSourceQuality(width: number | null | undefined, height: number | null | undefined) {
    if (!width || !height || width <= 0 || height <= 0) {
        return {
            ready: false,
            detail: 'Pixel dimensions are unavailable. Upload a verified original.',
        };
    }

    const longEdge = Math.max(width, height);
    const shortEdge = Math.min(width, height);
    if (longEdge < PUBLIC_ARTWORK_SOURCE_MINIMUM.longEdge || shortEdge < PUBLIC_ARTWORK_SOURCE_MINIMUM.shortEdge) {
        return {
            ready: false,
            detail: `${width.toLocaleString()} × ${height.toLocaleString()} px is below the ${PUBLIC_ARTWORK_SOURCE_MINIMUM.longEdge.toLocaleString()} × ${PUBLIC_ARTWORK_SOURCE_MINIMUM.shortEdge.toLocaleString()} px artwork target.`,
        };
    }

    return {
        ready: true,
        detail: `${width.toLocaleString()} × ${height.toLocaleString()} px meets the public artwork target.`,
    };
}

export function adjacentImageIndexes(length: number, centerIndex: number) {
    if (length < 2) return [];

    const previous = (centerIndex - 1 + length) % length;
    const next = (centerIndex + 1) % length;

    return previous === next ? [next] : [previous, next];
}
