import type { PiecesWithImages } from '@/types/artwork';

export function summarizeFramedDimensionReadiness(artworks: PiecesWithImages[]) {
    const framed = artworks.filter((item) => item.active && item.framed);
    const missing = framed.filter((item) => !item.framed_width || !item.framed_height);
    const verified = framed.filter((item) => item.framed_width && item.framed_height && item.framed_dimensions_verified);
    const estimated = framed.filter((item) => item.framed_width && item.framed_height && !item.framed_dimensions_verified);
    return {
        total: framed.length,
        missing: missing.length,
        availableMissing: missing.filter((item) => item.available && !item.sold).length,
        estimated: estimated.length,
        verified: verified.length,
    };
}
