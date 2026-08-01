export type GalleryWallSize = { widthInches: number; heightInches: number };
export type GalleryWallPlacementGeometry = {
    id: string;
    centerXInches: number;
    centerYInches: number;
    widthInches: number;
    heightInches: number;
};

export type GalleryWallBounds = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};

export function galleryPlacementBounds(placement: GalleryWallPlacementGeometry): GalleryWallBounds {
    return {
        left: placement.centerXInches - placement.widthInches / 2,
        right: placement.centerXInches + placement.widthInches / 2,
        top: placement.centerYInches - placement.heightInches / 2,
        bottom: placement.centerYInches + placement.heightInches / 2,
    };
}

export function galleryPlacementFitsWall(wall: GalleryWallSize, placement: GalleryWallPlacementGeometry) {
    const bounds = galleryPlacementBounds(placement);
    return bounds.left >= 0 && bounds.top >= 0 && bounds.right <= wall.widthInches && bounds.bottom <= wall.heightInches;
}

export function galleryPlacementsOverlap(a: GalleryWallPlacementGeometry, b: GalleryWallPlacementGeometry, clearance = 0) {
    const one = galleryPlacementBounds(a);
    const two = galleryPlacementBounds(b);
    return !(
        one.right + clearance <= two.left ||
        two.right + clearance <= one.left ||
        one.bottom + clearance <= two.top ||
        two.bottom + clearance <= one.top
    );
}

export function galleryWallLayoutIssues(wall: GalleryWallSize, placements: GalleryWallPlacementGeometry[]) {
    const outOfBoundsIds = placements.filter((item) => !galleryPlacementFitsWall(wall, item)).map((item) => item.id);
    const overlappingPairs: Array<[string, string]> = [];
    for (let index = 0; index < placements.length; index += 1) {
        for (let next = index + 1; next < placements.length; next += 1) {
            if (galleryPlacementsOverlap(placements[index], placements[next])) {
                overlappingPairs.push([placements[index].id, placements[next].id]);
            }
        }
    }
    return { outOfBoundsIds, overlappingPairs, valid: outOfBoundsIds.length === 0 && overlappingPairs.length === 0 };
}

export function clampGalleryPlacement(wall: GalleryWallSize, placement: GalleryWallPlacementGeometry) {
    return {
        ...placement,
        centerXInches: Math.max(
            placement.widthInches / 2,
            Math.min(wall.widthInches - placement.widthInches / 2, placement.centerXInches),
        ),
        centerYInches: Math.max(
            placement.heightInches / 2,
            Math.min(wall.heightInches - placement.heightInches / 2, placement.centerYInches),
        ),
    };
}
