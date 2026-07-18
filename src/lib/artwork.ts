import type { PiecesWithImages } from '@/db/schema';

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

export function dimensions(piece: Pick<PiecesWithImages, 'real_width' | 'real_height' | 'framed'>) {
    if (!piece.real_width || !piece.real_height) return piece.framed ? 'Framed' : 'Dimensions available on request';
    return `${piece.real_width} × ${piece.real_height} in${piece.framed ? ' · Framed' : ''}`;
}

export function imageSource(piece: Pick<PiecesWithImages, 'image_path' | 'small_image_path'>, small = false) {
    return (small && piece.small_image_path) || piece.image_path;
}

export function placeLabel(piece: Pick<PiecesWithImages, 'theme'>) {
    return piece.theme?.trim() || 'Jill Weeks Smith studio';
}
