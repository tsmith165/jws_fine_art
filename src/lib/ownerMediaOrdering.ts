export type ReorderableArtworkMedia = {
    id: string | number;
    kind: 'primary' | 'extra' | 'progress';
};

export function reorderArtworkMedia<T extends ReorderableArtworkMedia>(items: T[], currentId: T['id'], targetId: T['id']): T[] {
    const currentIndex = items.findIndex((item) => item.id === currentId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) return items;

    const current = items[currentIndex];
    const target = items[targetIndex];
    if (current.kind === 'primary' || current.kind !== target.kind) return items;

    const next = [...items];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    return next;
}
