import { galleryPlacementsOverlap, type GalleryWallPlacementGeometry, type GalleryWallSize } from './galleryWallLayout';

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

function fallbackShelves<T extends GalleryWallPlacementGeometry>(wall: GalleryWallSize, placements: T[]) {
    const sorted = [...placements].sort((a, b) => b.heightInches - a.heightInches || b.widthInches - a.widthInches);
    const rows: T[][] = [];
    for (const placement of sorted) {
        const row = rows.find(
            (candidate) =>
                candidate.reduce((total, item) => total + item.widthInches, 0) + candidate.length * 3 + placement.widthInches <=
                wall.widthInches - 12,
        );
        if (row) row.push(placement);
        else rows.push([placement]);
    }
    const rowHeights = rows.map((row) => Math.max(...row.map((item) => item.heightInches)));
    const totalHeight = rowHeights.reduce((total, height) => total + height, 0) + Math.max(0, rows.length - 1) * 4;
    let y = (wall.heightInches - totalHeight) / 2;
    const positioned = new Map<string, T>();
    rows.forEach((row, rowIndex) => {
        const contentWidth = row.reduce((total, item) => total + item.widthInches, 0) + Math.max(0, row.length - 1) * 4;
        let x = (wall.widthInches - contentWidth) / 2;
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

export function suggestGalleryWallLayout<T extends GalleryWallPlacementGeometry>(wall: GalleryWallSize, placements: T[], seed: number) {
    if (!placements.length) return placements;
    if (placements.length === 1) {
        return [{ ...placements[0], centerXInches: wall.widthInches / 2, centerYInches: wall.heightInches * 0.48 }];
    }

    const random = randomSource(seed);
    const largestFirst = [...placements].sort((a, b) => b.widthInches * b.heightInches - a.widthInches * a.heightInches);
    const xStops = Array.from({ length: 13 }, (_, index) => wall.widthInches * (0.1 + index * (0.8 / 12)));
    const yStops = Array.from({ length: 8 }, (_, index) => wall.heightInches * (0.17 + index * (0.62 / 7)));
    const baseCandidates = xStops.flatMap((x) => yStops.map((y) => ({ x, y })));

    for (let attempt = 0; attempt < 48; attempt += 1) {
        const placed: T[] = [];
        const focalX = wall.widthInches * (0.38 + random() * 0.24);
        const focalY = wall.heightInches * (0.36 + random() * 0.28);
        let valid = true;

        for (const placement of largestFirst) {
            const candidates = shuffled(baseCandidates, random)
                .map((candidate) => ({
                    ...candidate,
                    score:
                        Math.hypot(candidate.x - focalX, candidate.y - focalY) * (0.45 + random() * 0.9) +
                        Math.abs(candidate.y - wall.heightInches * 0.48) * random(),
                }))
                .sort((a, b) => a.score - b.score);
            const candidate = candidates.find(({ x, y }) => {
                const next = { ...placement, centerXInches: x, centerYInches: y };
                if (
                    x - placement.widthInches / 2 < 4 ||
                    x + placement.widthInches / 2 > wall.widthInches - 4 ||
                    y - placement.heightInches / 2 < 7 ||
                    y + placement.heightInches / 2 > wall.heightInches - 7
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

    return fallbackShelves(wall, placements);
}
