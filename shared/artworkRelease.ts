const RELEASE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function releaseDateTimestamp(value: string): number | null {
    const match = RELEASE_DATE_PATTERN.exec(value.trim());
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const timestamp = Date.UTC(year, month - 1, day, 12);
    const parsed = new Date(timestamp);
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return null;
    return timestamp;
}

export function releaseDateValue(timestamp: number | null | undefined): string {
    if (!Number.isFinite(timestamp)) return '';
    const date = new Date(timestamp as number);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function releaseDateLabel(timestamp: number | null | undefined): string {
    if (!Number.isFinite(timestamp)) return '';
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(new Date(timestamp as number));
}

export function isFutureReleaseDate(timestamp: number, now = Date.now()): boolean {
    return releaseDateValue(timestamp) > releaseDateValue(now);
}

export function compareArtworkReleasedNewest<T extends { id: number; released_at: number | null | undefined }>(a: T, b: T): number {
    return (b.released_at ?? 0) - (a.released_at ?? 0) || b.id - a.id;
}
