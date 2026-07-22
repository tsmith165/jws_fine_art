export function adjacentImageIndexes(length: number, centerIndex: number) {
    if (length < 2) return [];

    const previous = (centerIndex - 1 + length) % length;
    const next = (centerIndex + 1) % length;

    return previous === next ? [next] : [previous, next];
}
