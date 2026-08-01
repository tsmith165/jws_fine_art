import type { PiecesWithImages } from '@/types/artwork';
import { finishedArtworkDimensions } from '@shared/artworkDimensions';

export function artworkHref(piece: Pick<PiecesWithImages, 'id' | 'slug'>) {
    return `/work/${piece.slug ?? piece.id}`;
}

export function artworkStatus(piece: Pick<PiecesWithImages, 'sold' | 'available'>) {
    if (piece.sold) return 'Sold';
    if (piece.available) return 'Available';
    return 'Private collection';
}

export function isPurchasable(piece: Pick<PiecesWithImages, 'active' | 'available' | 'sold' | 'price'>) {
    return piece.active && piece.available && !piece.sold && piece.price > 0;
}

export function money(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function dimensions(
    piece: Pick<
        PiecesWithImages,
        'real_width' | 'real_height' | 'framed' | 'framed_width' | 'framed_height' | 'framed_dimensions_verified'
    >,
) {
    if (!piece.real_width || !piece.real_height) return piece.framed ? 'Framed dimensions being verified' : 'Dimensions available on request';
    const artwork = `${piece.real_width} × ${piece.real_height} in`;
    if (!piece.framed) return artwork;
    const finished = artworkScaleDimensions(piece);
    if (!finished) return `Artwork ${artwork} · Framed size being verified`;
    return `Artwork ${artwork} · ${finished.estimated ? 'Estimated framed size' : 'Framed size'} ${finished.widthInches} × ${finished.heightInches} in`;
}

export function artworkScaleDimensions(
    piece: Pick<
        PiecesWithImages,
        'real_width' | 'real_height' | 'framed' | 'framed_width' | 'framed_height' | 'framed_dimensions_verified'
    >,
) {
    return finishedArtworkDimensions({
        framed: piece.framed,
        widthInches: piece.real_width,
        heightInches: piece.real_height,
        framedWidthInches: piece.framed_width,
        framedHeightInches: piece.framed_height,
        framedDimensionsVerified: piece.framed_dimensions_verified,
    });
}

export function scaleDimensionsLabel(
    piece: Pick<
        PiecesWithImages,
        'real_width' | 'real_height' | 'framed' | 'framed_width' | 'framed_height' | 'framed_dimensions_verified'
    >,
) {
    const scale = artworkScaleDimensions(piece);
    if (!scale) return dimensions(piece);
    const prefix = scale.source === 'framed-estimate' ? 'Estimated framed size' : scale.source === 'framed-verified' ? 'Framed size' : 'Artwork size';
    return `${prefix} · ${scale.widthInches} × ${scale.heightInches} in`;
}

export function imageSource(piece: Pick<PiecesWithImages, 'image_path' | 'small_image_path'>, small = false) {
    return (small && piece.small_image_path) || piece.image_path;
}

export function placeLabel(piece: Pick<PiecesWithImages, 'theme'>) {
    return piece.theme?.trim() || 'Jill Weeks Smith studio';
}
