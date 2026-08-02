import {
    galleryPlacementsOverlap,
    type GalleryWallBounds,
    type GalleryWallPlacementGeometry,
    type GalleryWallSize,
} from './galleryWallLayout';

function randomSource(seed: number) {
    let value = seed >>> 0;
    return () => {
        value += 0x6d2b79f5;
        let result = value;
        result = Math.imul(result ^ (result >>> 15), result | 1);
        result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
        return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffled<T>(items: T[], random: () => number) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
        const next = Math.floor(random() * (index + 1));
        [copy[index], copy[next]] = [copy[next], copy[index]];
    }
    return copy;
}

function usableBounds(wall: GalleryWallSize, bounds?: GalleryWallBounds): GalleryWallBounds {
    return bounds ?? { left: 4, right: wall.widthInches - 4, top: 7, bottom: wall.heightInches - 7 };
}

function fallbackShelves<T extends GalleryWallPlacementGeometry>(wall: GalleryWallSize, placements: T[], requestedBounds?: GalleryWallBounds) {
    const bounds = usableBounds(wall, requestedBounds);
    const availableWidth = bounds.right - bounds.left;
    const availableHeight = bounds.bottom - bounds.top;
    const sorted = [...placements].sort((a, b) => b.heightInches - a.heightInches || b.widthInches - a.widthInches);
    const rows: T[][] = [];
    for (const placement of sorted) {
        const row = rows.find(
            (candidate) =>
                candidate.reduce((total, item) => total + item.widthInches, 0) + candidate.length * 3 + placement.widthInches <=
                availableWidth,
        );
        if (row) row.push(placement);
        else rows.push([placement]);
    }
    const rowHeights = rows.map((row) => Math.max(...row.map((item) => item.heightInches)));
    const totalHeight = rowHeights.reduce((total, height) => total + height, 0) + Math.max(0, rows.length - 1) * 4;
    let y = bounds.top + Math.max(0, (availableHeight - totalHeight) / 2);
    const positioned = new Map<string, T>();
    rows.forEach((row, rowIndex) => {
        const contentWidth = row.reduce((total, item) => total + item.widthInches, 0) + Math.max(0, row.length - 1) * 4;
        let x = bounds.left + Math.max(0, (availableWidth - contentWidth) / 2);
        row.forEach((placement) => {
            positioned.set(placement.id, {
                ...placement,
                centerXInches: x + placement.widthInches / 2,
                centerYInches: y + rowHeights[rowIndex] / 2,
            });
            x += placement.widthInches + 4;
        });
        y += rowHeights[rowIndex] + 4;
    });
    return placements.map((placement) => positioned.get(placement.id) ?? placement);
}

export function suggestGalleryWallLayout<T extends GalleryWallPlacementGeometry>(
    wall: GalleryWallSize,
    placements: T[],
    seed: number,
    options?: { bounds?: GalleryWallBounds },
) {
    const bounds = usableBounds(wall, options?.bounds);
    if (!placements.length) return placements;
    if (placements.length === 1) {
        return [
            {
                ...placements[0],
                centerXInches: (bounds.left + bounds.right) / 2,
                centerYInches: (bounds.top + bounds.bottom) / 2,
            },
        ];
    }

    const random = randomSource(seed);
    const largestFirst = [...placements].sort((a, b) => b.widthInches * b.heightInches - a.widthInches * a.heightInches);
    const usableWidth = bounds.right - bounds.left;
    const usableHeight = bounds.bottom - bounds.top;
    const xStops = Array.from({ length: 13 }, (_, index) => bounds.left + usableWidth * (index / 12));
    const yStops = Array.from({ length: 8 }, (_, index) => bounds.top + usableHeight * (index / 7));
    const baseCandidates = xStops.flatMap((x) => yStops.map((y) => ({ x, y })));

    for (let attempt = 0; attempt < 48; attempt += 1) {
        const placed: T[] = [];
        const focalX = bounds.left + usableWidth * (0.35 + random() * 0.3);
        const focalY = bounds.top + usableHeight * (0.35 + random() * 0.3);
        let valid = true;

        for (const placement of largestFirst) {
            const candidates = shuffled(baseCandidates, random)
                .map((candidate) => ({
                    ...candidate,
                    score:
                        Math.hypot(candidate.x - focalX, candidate.y - focalY) * (0.45 + random() * 0.9) +
                        Math.abs(candidate.y - (bounds.top + bounds.bottom) / 2) * random(),
                }))
                .sort((a, b) => a.score - b.score);
            const candidate = candidates.find(({ x, y }) => {
                const next = { ...placement, centerXInches: x, centerYInches: y };
                if (
                    x - placement.widthInches / 2 < bounds.left ||
                    x + placement.widthInches / 2 > bounds.right ||
                    y - placement.heightInches / 2 < bounds.top ||
                    y + placement.heightInches / 2 > bounds.bottom
                )
                    return false;
                return placed.every((item) => !galleryPlacementsOverlap(item, next, 3));
            });
            if (!candidate) {
                valid = false;
                break;
            }
            placed.push({ ...placement, centerXInches: candidate.x, centerYInches: candidate.y });
        }

        if (valid) {
            const byId = new Map(placed.map((placement) => [placement.id, placement]));
            return placements.map((placement) => byId.get(placement.id) ?? placement);
        }
    }

    return fallbackShelves(wall, placements, bounds);
}
