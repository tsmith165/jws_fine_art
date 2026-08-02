export type GalleryWallLabelMode = 'hidden' | 'left' | 'right' | 'bottom-left' | 'bottom-right';

export type GalleryWallBelowLabelMode = 'hidden' | 'bottom-left' | 'bottom-right';

export function normalizeGalleryWallLabelMode(mode: GalleryWallLabelMode | null | undefined): GalleryWallBelowLabelMode {
    if (mode === 'right' || mode === 'bottom-right') return 'bottom-right';
    if (mode === 'left' || mode === 'bottom-left') return 'bottom-left';
    return 'hidden';
}
