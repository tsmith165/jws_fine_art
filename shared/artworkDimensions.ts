export const FRAMED_DIMENSIONS_ESTIMATE_VERSION = 1;
export const DEFAULT_FRAME_ALLOWANCE_PER_SIDE_INCHES = 1.5;

export type ArtworkDimensionSource = 'artwork' | 'framed-estimate' | 'framed-verified';

export type ArtworkDimensionInput = {
    framed: boolean | null | undefined;
    widthInches: number | null | undefined;
    heightInches: number | null | undefined;
    framedWidthInches?: number | null;
    framedHeightInches?: number | null;
    framedDimensionsVerified?: boolean | null;
};

export type FinishedArtworkDimensions = {
    widthInches: number;
    heightInches: number;
    source: ArtworkDimensionSource;
    estimated: boolean;
};

function validDimension(value: number | null | undefined): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export function roundToQuarterInch(value: number) {
    return Math.round(value * 4) / 4;
}

export function estimateFramedDimensions(
    widthInches: number | null | undefined,
    heightInches: number | null | undefined,
): Pick<FinishedArtworkDimensions, 'widthInches' | 'heightInches'> | null {
    if (!validDimension(widthInches) || !validDimension(heightInches)) return null;
    const totalAllowance = DEFAULT_FRAME_ALLOWANCE_PER_SIDE_INCHES * 2;
    return {
        widthInches: roundToQuarterInch(widthInches + totalAllowance),
        heightInches: roundToQuarterInch(heightInches + totalAllowance),
    };
}

export function finishedArtworkDimensions(input: ArtworkDimensionInput): FinishedArtworkDimensions | null {
    if (input.framed) {
        if (!validDimension(input.framedWidthInches) || !validDimension(input.framedHeightInches)) return null;
        const verified = Boolean(input.framedDimensionsVerified);
        return {
            widthInches: input.framedWidthInches,
            heightInches: input.framedHeightInches,
            source: verified ? 'framed-verified' : 'framed-estimate',
            estimated: !verified,
        };
    }
    if (!validDimension(input.widthInches) || !validDimension(input.heightInches)) return null;
    return {
        widthInches: input.widthInches,
        heightInches: input.heightInches,
        source: 'artwork',
        estimated: false,
    };
}

export type ArtworkImageProportionsInput = {
    width: number | null | undefined;
    height: number | null | undefined;
    crop?: { top: number; right: number; bottom: number; left: number } | null;
};

export function artworkImageAspectRatio(image: ArtworkImageProportionsInput) {
    if (!validDimension(image.width) || !validDimension(image.height)) return null;
    const visibleWidth = image.width * (1 - (image.crop?.left ?? 0) - (image.crop?.right ?? 0));
    const visibleHeight = image.height * (1 - (image.crop?.top ?? 0) - (image.crop?.bottom ?? 0));
    if (!validDimension(visibleWidth) || !validDimension(visibleHeight)) return null;
    return visibleWidth / visibleHeight;
}

// Artwork photos rarely share the proportions of the finished (often estimated
// framed) size, so an image box sized to that footprint makes `object-fit:
// cover` trim the painting's edges. Fit the visible image inside the footprint
// instead: the whole artwork shows, and the box never grows past the footprint
// that wall layout, overlap, and bounds checks already use.
export function fitArtworkImageToDimensions(
    dimensions: Pick<FinishedArtworkDimensions, 'widthInches' | 'heightInches'>,
    image: ArtworkImageProportionsInput,
) {
    const ratio = artworkImageAspectRatio(image);
    if (!ratio) return { widthInches: dimensions.widthInches, heightInches: dimensions.heightInches };
    if (ratio >= dimensions.widthInches / dimensions.heightInches) {
        return { widthInches: dimensions.widthInches, heightInches: dimensions.widthInches / ratio };
    }
    return { widthInches: dimensions.heightInches * ratio, heightInches: dimensions.heightInches };
}

export function artworkShippingDimensions(input: ArtworkDimensionInput, useFinishedDimensions: boolean) {
    if (useFinishedDimensions) return finishedArtworkDimensions(input);
    if (!validDimension(input.widthInches) || !validDimension(input.heightInches)) return null;
    return {
        widthInches: input.widthInches,
        heightInches: input.heightInches,
        source: 'artwork' as const,
        estimated: false,
    };
}
