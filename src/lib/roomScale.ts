export const LIVING_ROOM_SCALE = {
    image: {
        src: '/editorial/rooms/view-at-scale-living-room.webp',
        width: 1538,
        height: 1023,
    },
    // IMG_0593 was calibrated from the 30 × 24 in finished frame photographed
    // in the original room image. The clean plate preserves the same crop.
    sourceReference: {
        widthInches: 30,
        heightInches: 24,
        pixelsPerInch: 21.2,
        sourceWidth: 2526,
        sourceHeight: 1681,
    },
    placementAnchor: {
        xPercent: 50,
        yPercent: 45.6,
    },
    clearWall: {
        widthInches: 96,
        heightInches: 36,
    },
} as const;

export interface RoomArtworkPlacement {
    widthPercent: number;
    heightPercent: number;
    centerXPercent: number;
    centerYPercent: number;
    fitsClearWall: boolean;
}

export function getLivingRoomPlacement(widthInches: number, heightInches: number): RoomArtworkPlacement {
    const { sourceReference, placementAnchor, clearWall } = LIVING_ROOM_SCALE;
    const widthPercent = (widthInches * sourceReference.pixelsPerInch * 100) / sourceReference.sourceWidth;
    const heightPercent = (heightInches * sourceReference.pixelsPerInch * 100) / sourceReference.sourceHeight;

    return {
        widthPercent,
        heightPercent,
        centerXPercent: placementAnchor.xPercent,
        centerYPercent: placementAnchor.yPercent,
        fitsClearWall: widthInches <= clearWall.widthInches && heightInches <= clearWall.heightInches,
    };
}
