export const GALLERY_WALL_PRESETS = [
    {
        key: 'white-oak',
        label: 'White gallery + bench',
        description: 'Bright white walls, pale oak floors, and a quiet central bench.',
        image: '/images/gallery-walls/white-bench-gallery.webp',
        backgroundPosition: 'center 52%',
        sceneAspectRatio: 1448 / 1086,
        recommendedWallSize: { widthInches: 144, heightInches: 96 },
        usableArea: { left: 0.07, right: 0.93, top: 0.1, bottom: 0.62 },
        floorStyle: 'oak',
        lighting: 'daylight',
    },
    {
        key: 'warm-plaster',
        label: 'Ochre spotlights',
        description: 'Warm ochre walls with three focused gallery lights.',
        image: '/images/gallery-walls/ochre-spotlight-gallery.webp',
        backgroundPosition: 'center center',
        sceneAspectRatio: 1538 / 1023,
        recommendedWallSize: { widthInches: 144, heightInches: 96 },
        usableArea: { left: 0.07, right: 0.93, top: 0.12, bottom: 0.78 },
        floorStyle: 'oak',
        lighting: 'gallery',
    },
    {
        key: 'museum-green',
        label: 'Sage + concrete',
        description: 'Muted sage paneling above a dark concrete floor.',
        image: '/images/gallery-walls/sage-concrete-gallery.webp',
        backgroundPosition: 'center center',
        sceneAspectRatio: 1537 / 1023,
        recommendedWallSize: { widthInches: 144, heightInches: 96 },
        usableArea: { left: 0.07, right: 0.93, top: 0.12, bottom: 0.72 },
        floorStyle: 'concrete',
        lighting: 'soft',
    },
    {
        key: 'charcoal',
        label: 'Charcoal + oak',
        description: 'A charcoal alcove grounded by warm parquet flooring.',
        image: '/images/gallery-walls/charcoal-oak-gallery.webp',
        backgroundPosition: 'center center',
        sceneAspectRatio: 1538 / 1023,
        recommendedWallSize: { widthInches: 144, heightInches: 96 },
        usableArea: { left: 0.07, right: 0.88, top: 0.12, bottom: 0.77 },
        floorStyle: 'oak',
        lighting: 'soft',
    },
    {
        key: 'midnight',
        label: 'Midnight spotlight',
        description: 'Deep navy walls, a cool center light, and warm oak below.',
        image: '/images/gallery-walls/midnight-oak-gallery.webp',
        backgroundPosition: 'center center',
        sceneAspectRatio: 1538 / 1023,
        recommendedWallSize: { widthInches: 144, heightInches: 96 },
        usableArea: { left: 0.07, right: 0.93, top: 0.12, bottom: 0.76 },
        floorStyle: 'oak',
        lighting: 'gallery',
    },
] as const;

export type GalleryWallPresetKey = (typeof GALLERY_WALL_PRESETS)[number]['key'];

export function galleryWallPreset(key: GalleryWallPresetKey) {
    return GALLERY_WALL_PRESETS.find((preset) => preset.key === key) ?? GALLERY_WALL_PRESETS[0];
}

export function galleryWallSurfaceStyle(key: GalleryWallPresetKey) {
    const preset = galleryWallPreset(key);
    return {
        backgroundImage: `url("${preset.image}")`,
        backgroundPosition: preset.backgroundPosition,
        backgroundSize: '100% 100%',
    };
}

export function galleryWallSceneAspectRatio(key: GalleryWallPresetKey) {
    return galleryWallPreset(key).sceneAspectRatio;
}

export function galleryWallPlacementBounds(key: GalleryWallPresetKey, widthInches: number, heightInches: number) {
    const area = galleryWallPreset(key).usableArea;
    return {
        left: widthInches * area.left,
        right: widthInches * area.right,
        top: heightInches * area.top,
        bottom: heightInches * area.bottom,
    };
}
