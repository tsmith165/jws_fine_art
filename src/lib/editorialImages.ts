export interface EditorialImage {
    src: string;
    width: number;
    height: number;
    alt: string;
}

export const EDITORIAL_IMAGES = {
    primaryPortrait: {
        src: '/editorial/artist/jill-weeks-smith-primary-portrait.webp',
        width: 1800,
        height: 2703,
        alt: 'Jill Weeks Smith seated in her San Diego home beside an original coastal painting',
    },
    seatedPortrait: {
        src: '/editorial/artist/jill-weeks-smith-seated-portrait.webp',
        width: 1800,
        height: 2704,
        alt: 'Artist Jill Weeks Smith seated beside one of her coastal paintings',
    },
    coastalPortrait: {
        src: '/editorial/artist/jill-weeks-smith-coastal-portrait.webp',
        width: 1248,
        height: 1874,
        alt: 'Jill Weeks Smith standing on the Southern California coast',
    },
    coastalPortraitCamera: {
        src: '/editorial/artist/jill-weeks-smith-coastal-portrait-camera.webp',
        width: 1361,
        height: 1814,
        alt: 'Jill Weeks Smith photographing the Southern California coastline',
    },
    studioPortrait: {
        src: '/editorial/artist/jill-weeks-smith-studio-portrait.webp',
        width: 1800,
        height: 2400,
        alt: 'Jill Weeks Smith in her studio beside a coastal arch painting',
    },
    studioPortraitAlternate: {
        src: '/editorial/artist/jill-weeks-smith-studio-portrait-alternate.webp',
        width: 1800,
        height: 2400,
        alt: 'Jill Weeks Smith standing beside an original coastal arch painting in her studio',
    },
    brushes: {
        src: '/editorial/studio/brushes-by-the-window.webp',
        width: 1401,
        height: 2104,
        alt: 'Jill Weeks Smith’s paint brushes and studio tools beside a window',
    },
    palette: {
        src: '/editorial/studio/brush-on-palette.webp',
        width: 1567,
        height: 2353,
        alt: 'A brush mixing blue and green oil paint on Jill Weeks Smith’s palette',
    },
    easelClose: {
        src: '/editorial/studio/painting-at-easel-close.webp',
        width: 1603,
        height: 2137,
        alt: 'Jill Weeks Smith painting at an easel in her studio',
    },
    easelSide: {
        src: '/editorial/studio/painting-at-easel-side.webp',
        width: 1546,
        height: 2061,
        alt: 'Jill Weeks Smith working on an oil painting from the side of her easel',
    },
    easelWide: {
        src: '/editorial/studio/painting-at-easel-wide.webp',
        width: 1800,
        height: 2400,
        alt: 'Jill Weeks Smith painting in her light-filled San Diego studio',
    },
    coastalArchInProgress: {
        src: '/editorial/studio/painting-coastal-arch.webp',
        width: 1536,
        height: 2306,
        alt: 'Jill Weeks Smith painting a coastal arch from behind her easel',
    },
} as const satisfies Record<string, EditorialImage>;
